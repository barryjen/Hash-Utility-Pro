
import crypto from "crypto";
import bcrypt from "bcrypt";

export interface RainbowTableEntry {
  hash: string;
  original: string;
  hashType: string;
}

export class RainbowTableService {
  private rainbowTables: Map<string, RainbowTableEntry[]>;
  
  constructor() {
    this.rainbowTables = new Map();
    this.initializeRainbowTables();
  }

  private initializeRainbowTables() {
    // Common passwords and phrases for rainbow table
    const commonPasswords = [
      "", "password", "123456", "123456789", "12345678", "12345", "1234567",
      "password123", "admin", "qwerty", "abc123", "Password1", "welcome",
      "monkey", "dragon", "letmein", "trustno1", "sunshine", "master",
      "hello", "world", "test", "user", "guest", "root", "toor", "pass",
      "secret", "love", "god", "sex", "money", "live", "forever", "cookie",
      "monster", "blue", "red", "green", "black", "white", "yellow", "orange",
      "purple", "pink", "brown", "gray", "silver", "gold", "diamond", "ruby",
      "emerald", "sapphire", "pearl", "crystal", "magic", "wizard", "dragon",
      "phoenix", "tiger", "lion", "eagle", "wolf", "bear", "shark", "dolphin",
      "butterfly", "flower", "rose", "lily", "daisy", "tulip", "orchid",
      "spring", "summer", "autumn", "winter", "january", "february", "march",
      "april", "may", "june", "july", "august", "september", "october",
      "november", "december", "monday", "tuesday", "wednesday", "thursday",
      "friday", "saturday", "sunday", "morning", "afternoon", "evening", "night",
      "midnight", "sunrise", "sunset", "rainbow", "sunshine", "moonlight",
      "starlight", "galaxy", "universe", "earth", "mars", "venus", "jupiter",
      "saturn", "neptune", "pluto", "sun", "moon", "star", "planet", "comet",
      "meteor", "asteroid", "space", "time", "light", "dark", "bright", "shadow",
      "fire", "water", "air", "earth", "ice", "snow", "rain", "cloud", "storm",
      "thunder", "lightning", "wind", "breeze", "ocean", "sea", "lake", "river",
      "mountain", "valley", "forest", "desert", "jungle", "field", "garden",
      "park", "street", "road", "path", "bridge", "house", "home", "family",
      "friend", "love", "heart", "soul", "mind", "body", "spirit", "angel",
      "devil", "heaven", "hell", "peace", "war", "hope", "faith", "trust",
      "truth", "lie", "good", "evil", "right", "wrong", "yes", "no", "maybe",
      "always", "never", "sometimes", "here", "there", "everywhere", "nowhere",
      "something", "nothing", "everything", "anything", "someone", "nobody",
      "everybody", "anybody", "me", "you", "us", "them", "he", "she", "it",
      "we", "they", "this", "that", "these", "those", "what", "when", "where",
      "why", "how", "who", "which", "whose", "whom", "hello world", "test123",
      "admin123", "root123", "password1", "password12", "password123", "123password"
    ];

    // Generate numeric sequences
    for (let i = 0; i <= 999999; i++) {
      commonPasswords.push(i.toString());
      if (i <= 9999) {
        commonPasswords.push(i.toString().padStart(4, '0'));
      }
      if (i <= 999) {
        commonPasswords.push(i.toString().padStart(3, '0'));
      }
    }

    // Generate common keyboard patterns
    const keyboardPatterns = [
      "qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890",
      "qwerty", "asdfgh", "zxcvbn", "123456", "654321",
      "qwertyui", "asdfghjk", "zxcvbnmm", "12345678",
      "87654321", "qwertyuio", "asdfghjkl", "zxcvbnm,",
      "123456789", "987654321", "qwertyuiop", "poiuytrewq"
    ];
    commonPasswords.push(...keyboardPatterns);

    // Generate dates
    for (let year = 1900; year <= 2030; year++) {
      for (let month = 1; month <= 12; month++) {
        for (let day = 1; day <= 31; day++) {
          if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) continue;
          if (month === 2 && day > 29) continue;
          
          const monthStr = month.toString().padStart(2, '0');
          const dayStr = day.toString().padStart(2, '0');
          
          commonPasswords.push(`${monthStr}/${dayStr}/${year}`);
          commonPasswords.push(`${monthStr}-${dayStr}-${year}`);
          commonPasswords.push(`${dayStr}/${monthStr}/${year}`);
          commonPasswords.push(`${dayStr}-${monthStr}-${year}`);
          commonPasswords.push(`${year}${monthStr}${dayStr}`);
          commonPasswords.push(`${dayStr}${monthStr}${year}`);
          commonPasswords.push(`${monthStr}${dayStr}${year.toString().slice(-2)}`);
        }
      }
    }

    // Generate hash tables for each algorithm
    this.generateHashTable('md5', commonPasswords);
    this.generateHashTable('sha1', commonPasswords);
    this.generateHashTable('sha256', commonPasswords);
    this.generateHashTable('sha512', commonPasswords);
    
    console.log(`Rainbow tables initialized with ${commonPasswords.length} entries per hash type`);
  }

  private generateHashTable(hashType: string, passwords: string[]) {
    const entries: RainbowTableEntry[] = [];
    
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
        
        entries.push({
          hash: hash.toLowerCase(),
          original: password,
          hashType
        });
      } catch (error) {
        // Skip invalid entries
        continue;
      }
    }
    
    this.rainbowTables.set(hashType, entries);
  }

  public lookupHash(hash: string): RainbowTableEntry | null {
    const normalizedHash = hash.toLowerCase().trim();
    
    // Auto-detect hash type based on length
    let hashType = this.detectHashType(normalizedHash);
    
    if (hashType === 'unknown') {
      // Try all hash types
      for (const [type, entries] of this.rainbowTables) {
        const found = entries.find(entry => entry.hash === normalizedHash);
        if (found) return found;
      }
      return null;
    }
    
    const entries = this.rainbowTables.get(hashType);
    if (!entries) return null;
    
    return entries.find(entry => entry.hash === normalizedHash) || null;
  }

  public batchLookup(hashes: string[]): RainbowTableEntry[] {
    const results: RainbowTableEntry[] = [];
    
    for (const hash of hashes) {
      const result = this.lookupHash(hash);
      if (result) {
        results.push(result);
      } else {
        // Add not found entry
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
    for (const [type, entries] of this.rainbowTables) {
      stats[type] = entries.length;
    }
    return stats;
  }
}

export const rainbowTableService = new RainbowTableService();
