import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHashOperationSchema, insertHashLookupSchema } from "@shared/schema";
import crypto from "crypto";
import bcrypt from "bcrypt";
import multer from "multer";
import { rainbowTableService } from "./rainbow-tables";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Hash generation endpoint with validation
  app.post("/api/hash/generate", async (req, res) => {
    try {
      const { inputText, hashTypes } = req.body;
      
      // Input validation
      if (!inputText || typeof inputText !== 'string') {
        return res.status(400).json({ error: "Input text is required and must be a string" });
      }
      
      if (inputText.length > 100000) {
        return res.status(400).json({ error: "Input text too large (max 100KB)" });
      }
      
      if (!hashTypes || !Array.isArray(hashTypes) || hashTypes.length === 0) {
        return res.status(400).json({ error: "Hash types array is required" });
      }
      
      const validHashTypes = ['md5', 'sha1', 'sha256', 'sha512', 'bcrypt'];
      const sanitizedHashTypes = hashTypes.filter(type => 
        typeof type === 'string' && validHashTypes.includes(type.toLowerCase())
      );
      
      if (sanitizedHashTypes.length === 0) {
        return res.status(400).json({ error: "No valid hash types provided" });
      }

      const hashResults: Record<string, string> = {};

      for (const hashType of hashTypes) {
        switch (hashType.toLowerCase()) {
          case 'md5':
            hashResults.md5 = crypto.createHash('md5').update(inputText).digest('hex');
            break;
          case 'sha1':
            hashResults.sha1 = crypto.createHash('sha1').update(inputText).digest('hex');
            break;
          case 'sha256':
            hashResults.sha256 = crypto.createHash('sha256').update(inputText).digest('hex');
            break;
          case 'sha512':
            hashResults.sha512 = crypto.createHash('sha512').update(inputText).digest('hex');
            break;
          case 'bcrypt':
            hashResults.bcrypt = await bcrypt.hash(inputText, 10);
            break;
          default:
            break;
        }
      }

      const operation = await storage.createHashOperation({
        inputText,
        fileName: null,
        fileSize: null,
        hashResults
      });

      // Learn the generated hashes for future lookups
      Object.entries(hashResults).forEach(([hashType, hashValue]) => {
        if (typeof hashValue === 'string') {
          rainbowTableService.learnHash(inputText, hashType, hashValue);
        }
      });

      res.json({ hashResults, operationId: operation.id });
    } catch (error) {
      console.error("Hash generation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // File hash generation endpoint with validation
  app.post("/api/hash/generate-file", upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { hashTypes } = req.body;
      
      if (!file) {
        return res.status(400).json({ error: "File is required" });
      }
      
      // File size validation (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        return res.status(400).json({ error: "File too large (max 50MB)" });
      }
      
      if (!hashTypes) {
        return res.status(400).json({ error: "Hash types required" });
      }

      const hashTypesArray = JSON.parse(hashTypes);
      const hashResults: Record<string, string> = {};

      for (const hashType of hashTypesArray) {
        switch (hashType.toLowerCase()) {
          case 'md5':
            hashResults.md5 = crypto.createHash('md5').update(file.buffer).digest('hex');
            break;
          case 'sha1':
            hashResults.sha1 = crypto.createHash('sha1').update(file.buffer).digest('hex');
            break;
          case 'sha256':
            hashResults.sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');
            break;
          case 'sha512':
            hashResults.sha512 = crypto.createHash('sha512').update(file.buffer).digest('hex');
            break;
          default:
            break;
        }
      }

      const operation = await storage.createHashOperation({
        inputText: null,
        fileName: file.originalname,
        fileSize: file.size.toString(),
        hashResults
      });

      // Learn the generated hashes for future lookups (using filename as the original)
      Object.entries(hashResults).forEach(([hashType, hashValue]) => {
        if (typeof hashValue === 'string') {
          rainbowTableService.learnHash(file.originalname, hashType, hashValue);
        }
      });

      res.json({ hashResults, operationId: operation.id });
    } catch (error) {
      console.error("File hash generation error:", error);
      res.status(500).json({ error: "Failed to generate file hashes" });
    }
  });

  // Hash lookup endpoint with validation
  app.post("/api/hash/lookup", async (req, res) => {
    try {
      const { hash, hashType } = req.body;
      
      if (!hash || typeof hash !== 'string') {
        return res.status(400).json({ error: "Hash is required and must be a string" });
      }
      
      // Validate hash format
      const hashRegex = /^[a-fA-F0-9]+$/;
      if (!hashRegex.test(hash)) {
        return res.status(400).json({ error: "Invalid hash format" });
      }
      
      if (hash.length > 256) {
        return res.status(400).json({ error: "Hash too long" });
      }

      // Use rainbow table service for hash lookup
      const lookupResult = rainbowTableService.lookupHash(hash);
      const found = lookupResult !== null && lookupResult.original !== '';
      const originalValue = found ? lookupResult?.original : null;

      const lookup = await storage.createHashLookup({
        hash,
        hashType: hashType || "auto-detect",
        originalValue: originalValue || null,
        found: found ? "true" : "false"
      });

      res.json({ 
        found, 
        originalValue: originalValue || null,
        lookupId: lookup.id 
      });
    } catch (error) {
      console.error("Hash lookup error:", error);
      res.status(500).json({ error: "Failed to lookup hash" });
    }
  });

  // Hash comparison endpoint
  app.post("/api/hash/compare", async (req, res) => {
    try {
      const { hash1, hash2 } = req.body;
      
      if (!hash1 || !hash2) {
        return res.status(400).json({ error: "Both hashes required" });
      }

      const match = hash1.toLowerCase() === hash2.toLowerCase();
      
      res.json({ match });
    } catch (error) {
      console.error("Hash comparison error:", error);
      res.status(500).json({ error: "Failed to compare hashes" });
    }
  });

  // Get hash operations history
  app.get("/api/hash/history", async (req, res) => {
    try {
      const operations = await storage.getHashOperations();
      const lookups = await storage.getHashLookups();
      
      res.json({
        operations: operations.reverse(), // Most recent first
        lookups: lookups.reverse(),
        stats: {
          totalOperations: operations.length,
          totalLookups: lookups.length,
          successfulLookups: lookups.filter(l => l.found === "true").length
        }
      });
    } catch (error) {
      console.error("History fetch error:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Batch hash generation with validation
  app.post("/api/hash/batch", async (req, res) => {
    try {
      const { inputs, hashTypes } = req.body;
      
      if (!inputs || !Array.isArray(inputs)) {
        return res.status(400).json({ error: "Inputs array is required" });
      }
      
      if (inputs.length > 100) {
        return res.status(400).json({ error: "Too many inputs (max 100)" });
      }
      
      if (!hashTypes || !Array.isArray(hashTypes)) {
        return res.status(400).json({ error: "Hash types array is required" });
      }
      
      // Validate each input
      for (const input of inputs) {
        if (typeof input !== 'string' || input.length > 10000) {
          return res.status(400).json({ error: "Each input must be a string under 10KB" });
        }
      }

      const results = [];
      
      for (const input of inputs) {
        const hashResults: Record<string, string> = {};
        
        for (const hashType of hashTypes) {
          switch (hashType.toLowerCase()) {
            case 'md5':
              hashResults.md5 = crypto.createHash('md5').update(input).digest('hex');
              break;
            case 'sha1':
              hashResults.sha1 = crypto.createHash('sha1').update(input).digest('hex');
              break;
            case 'sha256':
              hashResults.sha256 = crypto.createHash('sha256').update(input).digest('hex');
              break;
            case 'sha512':
              hashResults.sha512 = crypto.createHash('sha512').update(input).digest('hex');
              break;
            case 'bcrypt':
              hashResults.bcrypt = await bcrypt.hash(input, 10);
              break;
            default:
              break;
          }
        }

        const operation = await storage.createHashOperation({
          inputText: input,
          fileName: null,
          fileSize: null,
          hashResults
        });

        results.push({
          input,
          hashes: hashResults,
          operationId: operation.id
        });
      }

      res.json({ results });
    } catch (error) {
      console.error("Batch hash generation error:", error);
      res.status(500).json({ error: "Failed to generate batch hashes" });
    }
  });

  // HMAC generation
  app.post("/api/hash/hmac", async (req, res) => {
    try {
      const { message, key, algorithm = 'sha256' } = req.body;
      
      if (!message || !key) {
        return res.status(400).json({ error: "Message and key are required" });
      }

      const hmac = crypto.createHmac(algorithm, key).update(message).digest('hex');
      
      res.json({ hmac, algorithm, message, keyLength: key.length });
    } catch (error) {
      console.error("HMAC generation error:", error);
      res.status(500).json({ error: "Failed to generate HMAC" });
    }
  });

  // Hash validation
  app.post("/api/hash/validate", async (req, res) => {
    try {
      const { hash, type } = req.body;
      
      if (!hash) {
        return res.status(400).json({ error: "Hash is required" });
      }

      const patterns = {
        md5: /^[a-f0-9]{32}$/i,
        sha1: /^[a-f0-9]{40}$/i,
        sha256: /^[a-f0-9]{64}$/i,
        sha512: /^[a-f0-9]{128}$/i,
        bcrypt: /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9\.\/]{53}$/
      };

      let detectedType = 'unknown';
      let isValid = false;

      if (type && patterns[type as keyof typeof patterns]) {
        isValid = patterns[type as keyof typeof patterns].test(hash);
        detectedType = type;
      } else {
        // Auto-detect hash type
        for (const [hashType, pattern] of Object.entries(patterns)) {
          if (pattern.test(hash)) {
            detectedType = hashType;
            isValid = true;
            break;
          }
        }
      }

      res.json({ 
        valid: isValid, 
        detectedType, 
        length: hash.length,
        format: isValid ? 'valid' : 'invalid'
      });
    } catch (error) {
      console.error("Hash validation error:", error);
      res.status(500).json({ error: "Failed to validate hash" });
    }
  });

  // Get rainbow table statistics
  app.get("/api/hash/rainbow-stats", async (req, res) => {
    try {
      const stats = rainbowTableService.getStats();
      res.json({
        tableStats: stats,
        totalEntries: Object.values(stats).reduce((sum, count) => sum + count, 0)
      });
    } catch (error) {
      console.error("Rainbow table stats error:", error);
      res.status(500).json({ error: "Failed to get rainbow table statistics" });
    }
  });

  // Batch hash lookup/decryption
  app.post("/api/hash/batch-lookup", async (req, res) => {
    try {
      const { hashes } = req.body;
      
      if (!hashes || !Array.isArray(hashes)) {
        return res.status(400).json({ error: "Hashes array is required" });
      }

      // Use rainbow table service for batch lookup
      const lookupResults = rainbowTableService.batchLookup(hashes);
      const results = [];
      
      for (const result of lookupResults) {
        if (!result.hash) continue;
        
        const found = result.original !== '';
        
        // Store lookup in database
        const lookup = await storage.createHashLookup({
          hash: result.hash,
          hashType: result.hashType,
          originalValue: found ? result.original : null,
          found: found ? "true" : "false"
        });
        
        results.push({
          hash: result.hash,
          hashType: result.hashType,
          found,
          originalValue: found ? result.original : null,
          lookupId: lookup.id
        });
      }

      res.json({ results });
    } catch (error) {
      console.error("Batch hash lookup error:", error);
      res.status(500).json({ error: "Failed to perform batch lookup" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
