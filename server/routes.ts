import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHashOperationSchema, insertHashLookupSchema } from "@shared/schema";
import crypto from "crypto";
import bcrypt from "bcrypt";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Hash generation endpoint
  app.post("/api/hash/generate", async (req, res) => {
    try {
      const { inputText, hashTypes } = req.body;
      
      if (!inputText || !hashTypes || !Array.isArray(hashTypes)) {
        return res.status(400).json({ error: "Invalid input" });
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

      res.json({ hashResults, operationId: operation.id });
    } catch (error) {
      console.error("Hash generation error:", error);
      res.status(500).json({ error: "Failed to generate hashes" });
    }
  });

  // File hash generation endpoint
  app.post("/api/hash/generate-file", upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { hashTypes } = req.body;
      
      if (!file || !hashTypes) {
        return res.status(400).json({ error: "File and hash types required" });
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

      res.json({ hashResults, operationId: operation.id });
    } catch (error) {
      console.error("File hash generation error:", error);
      res.status(500).json({ error: "Failed to generate file hashes" });
    }
  });

  // Hash lookup endpoint
  app.post("/api/hash/lookup", async (req, res) => {
    try {
      const { hash, hashType } = req.body;
      
      if (!hash) {
        return res.status(400).json({ error: "Hash required" });
      }

      // Simple hash lookup database (in production, this would query actual rainbow tables)
      const commonHashes: Record<string, string> = {
        // MD5
        "5d41402abc4b2a76b9719d911017c592": "hello",
        "098f6bcd4621d373cade4e832627b4f6": "test",
        "d41d8cd98f00b204e9800998ecf8427e": "",
        "202cb962ac59075b964b07152d234b70": "123",
        "827ccb0eea8a706c4c34a16891f84e7b": "12345",
        // SHA1
        "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d": "hello",
        "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3": "test",
        "da39a3ee5e6b4b0d3255bfef95601890afd80709": "",
        "40bd001563085fc35165329ea1ff5c5ecbdbbeef": "123",
        "8cb2237d0679ca88db6464eac60da96345513964": "12345",
        // SHA256
        "2cf24dba4f21d4288091c98c9e04b621": "hello",
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08": "test",
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855": "",
        "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3": "123",
        "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5": "12345"
      };

      const originalValue = commonHashes[hash.toLowerCase()];
      const found = originalValue !== undefined;

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

  // Batch hash generation
  app.post("/api/hash/batch", async (req, res) => {
    try {
      const { inputs, hashTypes } = req.body;
      
      if (!inputs || !Array.isArray(inputs) || !hashTypes || !Array.isArray(hashTypes)) {
        return res.status(400).json({ error: "Invalid inputs or hash types" });
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

  const httpServer = createServer(app);
  return httpServer;
}
