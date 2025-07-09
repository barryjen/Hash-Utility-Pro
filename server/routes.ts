import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHashOperationSchema, insertHashLookupSchema } from "@shared/schema";
import crypto from "crypto";
import bcrypt from "bcrypt";
import multer from "multer";

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

  // Batch hash lookup/decryption
  app.post("/api/hash/batch-lookup", async (req, res) => {
    try {
      const { hashes } = req.body;
      
      if (!hashes || !Array.isArray(hashes)) {
        return res.status(400).json({ error: "Hashes array is required" });
      }

      // Extended hash lookup database
      const commonHashes: Record<string, string> = {
        // MD5
        "5d41402abc4b2a76b9719d911017c592": "hello",
        "098f6bcd4621d373cade4e832627b4f6": "test",
        "d41d8cd98f00b204e9800998ecf8427e": "",
        "202cb962ac59075b964b07152d234b70": "123",
        "827ccb0eea8a706c4c34a16891f84e7b": "12345",
        "5f4dcc3b5aa765d61d8327deb882cf99": "password",
        "e99a18c428cb38d5f260853678922e03": "abc123",
        "25d55ad283aa400af464c76d713c07ad": "hello world",
        "fc5e038d38a57032085441e7fe7010b0": "hashcat",
        "ad0234829205b90331e1c6be6b5e46b4": "admin",
        // SHA1
        "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d": "hello",
        "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3": "test",
        "da39a3ee5e6b4b0d3255bfef95601890afd80709": "",
        "40bd001563085fc35165329ea1ff5c5ecbdbbeef": "123",
        "8cb2237d0679ca88db6464eac60da96345513964": "12345",
        "5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8": "password",
        "6367c48dd193d56ea7b0baad25b19455e529f5ee": "abc123",
        "2aae6c35c94fcfb415dbe95f408b9ce91ee846ed": "hello world",
        "b89eaac7e61417341b710b727768294d0e6a277b": "admin",
        // SHA256
        "2cf24dba4f21d4288091c98c9e04b6216b9b4bfd7d2d76ed9c46b4b3b86f5ee3": "hello",
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08": "test",
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855": "",
        "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3": "123",
        "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5": "12345",
        "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8": "password",
        "6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090": "abc123",
        "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9": "hello world",
        "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918": "admin",
        // SHA512
        "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043": "hello",
        "ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff": "test",
        "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e": "",
        "3c9909afec25354d551dae21590bb26e38d53f2173b8d3dc3eee4c047e7ab1c1eb8b85103e3be7ba613b31bb5c9c36214dc9f14a42fd7a2fdb84856bca5c44c2": "123",
        "3627909a29c31381a071ec27f7c9ca97726182aed29a7ddd2e54353322cfb30abb9e3a6df2ac2c20fe23436311d678564d0c8d305930575f60e2d3d048184d79": "12345",
        "b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86": "password",
        "a9b9f04336ce0181a08e774e01113b98f52ad85c57b1e6e7bb5c2b3b97a5e9fbf9c3b1c7c8b3f8e5e7f4a0b7c0b4b7e6c8e9b5d0e3f8b9c0e5f7a8c1e9b4": "abc123",
        "309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f": "hello world",
        "c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec": "admin"
      };

      const results = [];
      
      for (const hash of hashes) {
        if (!hash || typeof hash !== 'string') {
          continue;
        }
        
        const trimmedHash = hash.trim().toLowerCase();
        const originalValue = commonHashes[trimmedHash];
        const found = originalValue !== undefined;
        
        // Auto-detect hash type
        let hashType = 'unknown';
        if (trimmedHash.length === 32 && /^[a-f0-9]{32}$/.test(trimmedHash)) {
          hashType = 'md5';
        } else if (trimmedHash.length === 40 && /^[a-f0-9]{40}$/.test(trimmedHash)) {
          hashType = 'sha1';
        } else if (trimmedHash.length === 64 && /^[a-f0-9]{64}$/.test(trimmedHash)) {
          hashType = 'sha256';
        } else if (trimmedHash.length === 128 && /^[a-f0-9]{128}$/.test(trimmedHash)) {
          hashType = 'sha512';
        }
        
        // Store lookup in database
        const lookup = await storage.createHashLookup({
          hash: trimmedHash,
          hashType,
          originalValue: originalValue || null,
          found: found ? "true" : "false"
        });
        
        results.push({
          hash: trimmedHash,
          hashType,
          found,
          originalValue: originalValue || null,
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
