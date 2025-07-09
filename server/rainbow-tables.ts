import crypto from "crypto";
import bcrypt from "bcrypt";

export interface RainbowTableEntry {
  hash: string;
  original: string;
  hashType: string;
}

export class RainbowTableService {
  private rainbowTables: Map<string, Map<string, string>>;
  private dynamicEntries: Map<string, Map<string, string>>;

  constructor() {
    this.rainbowTables = new Map();
    this.dynamicEntries = new Map();
    this.initializeRainbowTables();
    this.initializeDynamicTables();
  }

  private initializeRainbowTables() {
    // Optimized wordlist - focusing on most common passwords
    const commonPasswords = [
      // Top most common passwords
      "", "password", "123456", "123456789", "12345678", "12345", "1234567",
      "password123", "admin", "qwerty", "abc123", "Password1", "welcome",
      "monkey", "dragon", "letmein", "trustno1", "sunshine", "master",
      "hello", "world", "test", "user", "guest", "root", "toor", "pass",
      "secret", "love", "god", "sex", "money", "live", "forever", "cookie",

      // Essential dictionary words
      "password1", "password12", "password123", "123password", "admin123",
      "root123", "test123", "hello123", "welcome123", "computer", "internet",
      "security", "system", "network", "database", "server", "access",

      // Common names (reduced set)
      "john", "jane", "michael", "sarah", "david", "robert", "james",
      "jennifer", "william", "mary", "richard", "patricia", "charles",

      // Basic patterns
      "a", "aa", "aaa", "abc", "abcd", "abcde", "abcdef", "abcdefg",
      "qwerty", "qwertyui", "asdfgh", "zxcvbn", "111111", "000000",

      // Single digits and basic combinations
      "1", "12", "123", "1234", "12345", "123456", "1234567", "12345678",
      "123456789", "1234567890", "0", "00", "000", "0000", "00000",

      // Common keyboard patterns
      "qwerty", "asdfgh", "zxcvbn", "qwertyuiop", "asdfghjkl", "zxcvbnm",
      "poiuytrewq", "lkjhgfdsa", "mnbvcxz", "147258369", "159753",

      // Years and dates (limited range)
      "2024", "2023", "2022", "2021", "2020", "1990", "1980", "1970",
      "01011990", "01012000", "12121212", "11111111", "22222222",

      // Tech terms
      "google", "microsoft", "apple", "amazon", "facebook", "twitter",
      "instagram", "password", "admin", "login", "user", "guest"
    ];

    // Generate limited numeric sequences (0-9999 instead of millions)
    for (let i = 0; i <= 9999; i++) {
      commonPasswords.push(i.toString());
      if (i <= 999) {
        commonPasswords.push(i.toString().padStart(3, '0'));
      }
      if (i <= 99) {
        commonPasswords.push(i.toString().padStart(2, '0'));
      }
    }

    // Generate limited hex sequences (0-FF instead of 65535)
    for (let i = 0; i <= 255; i++) {
      commonPasswords.push(i.toString(16));
      commonPasswords.push(i.toString(16).toUpperCase());
      commonPasswords.push(i.toString(16).padStart(2, '0'));
      commonPasswords.push(i.toString(16).toUpperCase().padStart(2, '0'));
    }

    // Generate limited alphanumeric patterns
    for (let i = 0; i <= 999; i++) {
      commonPasswords.push(`a${i}`);
      commonPasswords.push(`test${i}`);
      commonPasswords.push(`user${i}`);
      commonPasswords.push(`admin${i}`);
    }

    // Generate limited date patterns (recent years only)
    for (let year = 2020; year <= 2024; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        commonPasswords.push(`${monthStr}${year}`);
        commonPasswords.push(`${year}${monthStr}`);
        commonPasswords.push(`01${monthStr}${year}`);
      }
    }

    // Generate basic variations for core words only
    const coreWords = ["password", "admin", "test", "user", "hello", "world"];
    for (const word of coreWords) {
      // Case variations
      commonPasswords.push(word.toLowerCase());
      commonPasswords.push(word.toUpperCase());
      commonPasswords.push(word.charAt(0).toUpperCase() + word.slice(1));

      // Common suffixes
      commonPasswords.push(word + '!');
      commonPasswords.push(word + '123');
      commonPasswords.push(word + '1');
      commonPasswords.push('123' + word);

      // Leetspeak (limited)
      let leet = word.replace(/a/g, '4').replace(/e/g, '3').replace(/i/g, '1')
                    .replace(/o/g, '0').replace(/s/g, '5').replace(/t/g, '7');
      commonPasswords.push(leet);
    }

    // Remove duplicates and limit total size
    const uniquePasswords = [...new Set(commonPasswords)].slice(0, 50000);

    // Generate hash tables for each algorithm using Maps for better performance
    this.generateHashTable('md5', uniquePasswords);
    this.generateHashTable('sha1', uniquePasswords);
    this.generateHashTable('sha256', uniquePasswords);
    this.generateHashTable('sha512', uniquePasswords);

    console.log(`Rainbow tables initialized with ${uniquePasswords.length} entries per hash type`);
  }

  private initializeDynamicTables() {
    // Initialize empty dynamic tables for each hash type
    this.dynamicEntries.set('md5', new Map());
    this.dynamicEntries.set('sha1', new Map());
    this.dynamicEntries.set('sha256', new Map());
    this.dynamicEntries.set('sha512', new Map());
  }

  private generateHashTable(hashType: string, passwords: string[]) {
    const hashMap = new Map<string, string>();

    for (const password of passwords) {
      try {
        let hash: string;

        switch (hashType) {
          case 'md5':
            hash = crypto.createHash('md5').update(password).digest('hex');
            break;
          case 'sha1':
            hash = crypto.createHash('sha1').update(password).digest('hex');
            break;
          case 'sha256':
            hash = crypto.createHash('sha256').update(password).digest('hex');
            break;
          case 'sha512':
            hash = crypto.createHash('sha512').update(password).digest('hex');
            break;
          default:
            continue;
        }

        hashMap.set(hash.toLowerCase(), password);
      } catch (error) {
        continue;
      }
    }

    this.rainbowTables.set(hashType, hashMap);
  }

  public learnHash(originalText: string, hashType: string, hashValue: string) {
    const normalizedHash = hashValue.toLowerCase().trim();
    const dynamicTable = this.dynamicEntries.get(hashType);
    
    if (dynamicTable && !dynamicTable.has(normalizedHash)) {
      dynamicTable.set(normalizedHash, originalText);
      console.log(`Learned new ${hashType} hash: ${normalizedHash} -> ${originalText}`);
    }
  }

  public lookupHash(hash: string): RainbowTableEntry | null {
    const normalizedHash = hash.toLowerCase().trim();
    const hashType = this.detectHashType(normalizedHash);

    if (hashType === 'unknown') {
      // Try all hash types - check dynamic tables first
      for (const [type, dynamicMap] of this.dynamicEntries) {
        const original = dynamicMap.get(normalizedHash);
        if (original) {
          return { hash: normalizedHash, original, hashType: type };
        }
      }
      
      // Then check static rainbow tables
      for (const [type, hashMap] of this.rainbowTables) {
        const original = hashMap.get(normalizedHash);
        if (original) {
          return { hash: normalizedHash, original, hashType: type };
        }
      }
      return null;
    }

    // Check dynamic table first
    const dynamicMap = this.dynamicEntries.get(hashType);
    if (dynamicMap) {
      const original = dynamicMap.get(normalizedHash);
      if (original) {
        return { hash: normalizedHash, original, hashType };
      }
    }

    // Then check static rainbow table
    const hashMap = this.rainbowTables.get(hashType);
    if (!hashMap) return null;

    const original = hashMap.get(normalizedHash);
    return original ? { hash: normalizedHash, original, hashType } : null;
  }

  public batchLookup(hashes: string[]): RainbowTableEntry[] {
    const results: RainbowTableEntry[] = [];

    for (const hash of hashes) {
      const result = this.lookupHash(hash);
      if (result) {
        results.push(result);
      } else {
        results.push({
          hash: hash.toLowerCase().trim(),
          original: '',
          hashType: this.detectHashType(hash.toLowerCase().trim())
        });
      }
    }

    return results;
  }

  private detectHashType(hash: string): string {
    if (/^[a-f0-9]{32}$/i.test(hash)) return 'md5';
    if (/^[a-f0-9]{40}$/i.test(hash)) return 'sha1';
    if (/^[a-f0-9]{64}$/i.test(hash)) return 'sha256';
    if (/^[a-f0-9]{128}$/i.test(hash)) return 'sha512';
    if (/^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9\.\/]{53}$/.test(hash)) return 'bcrypt';
    return 'unknown';
  }

  public getStats() {
    const stats: Record<string, number> = {};
    const dynamicStats: Record<string, number> = {};
    let totalEntries = 0;
    let totalDynamicEntries = 0;

    for (const [type, hashMap] of this.rainbowTables) {
      const size = hashMap.size;
      stats[type] = size;
      totalEntries += size;
    }

    for (const [type, dynamicMap] of this.dynamicEntries) {
      const size = dynamicMap.size;
      dynamicStats[type] = size;
      totalDynamicEntries += size;
    }

    return {
      tableStats: stats,
      dynamicStats,
      totalEntries,
      totalDynamicEntries
    };
  }
}

export const rainbowTableService = new RainbowTableService();