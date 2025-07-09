
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
    // Comprehensive wordlist for rainbow table
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

    // Add more comprehensive dictionary words
    const extendedWords = [
      // Technology terms
      "computer", "internet", "software", "hardware", "network", "database",
      "server", "client", "security", "encryption", "hash", "algorithm",
      "programming", "coding", "development", "website", "application",
      "system", "technology", "digital", "cyber", "virtual", "online",
      
      // Common names
      "john", "jane", "michael", "sarah", "david", "maria", "robert", "lisa",
      "james", "jennifer", "william", "elizabeth", "richard", "patricia",
      "charles", "barbara", "joseph", "susan", "thomas", "jessica",
      "christopher", "margaret", "daniel", "dorothy", "matthew", "helen",
      "anthony", "nancy", "mark", "betty", "donald", "sandra", "steven",
      "donna", "paul", "carol", "andrew", "ruth", "kenneth", "sharon",
      
      // Extended common passwords from breaches
      "football", "baseball", "basketball", "soccer", "tennis", "golf",
      "swimming", "running", "dancing", "music", "guitar", "piano",
      "singing", "reading", "writing", "cooking", "eating", "sleeping",
      "working", "playing", "learning", "teaching", "helping", "caring",
      "sharing", "giving", "taking", "making", "breaking", "fixing",
      "building", "creating", "destroying", "opening", "closing", "starting",
      "stopping", "moving", "staying", "going", "coming", "leaving",
      "arriving", "departing", "entering", "exiting", "walking", "running",
      
      // Tech companies and brands
      "google", "microsoft", "apple", "amazon", "facebook", "twitter",
      "instagram", "linkedin", "youtube", "netflix", "spotify", "adobe",
      "oracle", "ibm", "intel", "nvidia", "samsung", "sony", "tesla",
      "uber", "airbnb", "paypal", "ebay", "walmart", "target", "costco",
      
      // Single characters and short combinations
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
      "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
      "aa", "bb", "cc", "dd", "ee", "ff", "gg", "hh", "ii", "jj", "kk",
      "ll", "mm", "nn", "oo", "pp", "qq", "rr", "ss", "tt", "uu", "vv",
      "ww", "xx", "yy", "zz", "aaa", "bbb", "ccc", "ddd", "eee", "fff",
      
      // Special characters and symbols combinations
      "!!!", "???", "@@@", "###", "$$$", "%%%", "^^^", "&&&", "***",
      "(()", ")))", "___", "+++", "===", "---", "|||", "\\\\\\", "///",
      "<<<", ">>>", "~~~", "```", "...", ",,,"
    ];
    
    commonPasswords.push(...extendedWords);

    // Generate comprehensive numeric sequences
    for (let i = 0; i <= 9999999; i++) {
      commonPasswords.push(i.toString());
      if (i <= 99999) {
        commonPasswords.push(i.toString().padStart(5, '0'));
      }
      if (i <= 9999) {
        commonPasswords.push(i.toString().padStart(4, '0'));
      }
      if (i <= 999) {
        commonPasswords.push(i.toString().padStart(3, '0'));
      }
      if (i <= 99) {
        commonPasswords.push(i.toString().padStart(2, '0'));
      }
    }

    // Generate hexadecimal sequences
    for (let i = 0; i <= 65535; i++) {
      commonPasswords.push(i.toString(16));
      commonPasswords.push(i.toString(16).toUpperCase());
      if (i <= 255) {
        commonPasswords.push(i.toString(16).padStart(2, '0'));
        commonPasswords.push(i.toString(16).toUpperCase().padStart(2, '0'));
      }
    }

    // Generate alphabet combinations
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    // Single letters
    for (const char of alphabet) {
      commonPasswords.push(char);
      commonPasswords.push(char.toUpperCase());
    }
    
    // Two letter combinations (limited to reduce size)
    for (let i = 0; i < alphabet.length; i++) {
      for (let j = 0; j < alphabet.length; j++) {
        if (i <= 5 && j <= 5) { // Limit to reduce computation
          commonPasswords.push(alphabet[i] + alphabet[j]);
          commonPasswords.push((alphabet[i] + alphabet[j]).toUpperCase());
        }
      }
    }

    // Mixed alphanumeric patterns
    for (let i = 0; i <= 9999; i++) {
      commonPasswords.push(`a${i}`);
      commonPasswords.push(`A${i}`);
      commonPasswords.push(`${i}a`);
      commonPasswords.push(`${i}A`);
      commonPasswords.push(`test${i}`);
      commonPasswords.push(`user${i}`);
      commonPasswords.push(`pass${i}`);
      commonPasswords.push(`admin${i}`);
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

    // Generate common variations for existing words
    const variations = [];
    const baseWords = [...commonPasswords];
    
    for (const word of baseWords.slice(0, 500)) { // Limit to first 500 to avoid exponential growth
      if (typeof word === 'string' && word.length > 2 && word.length < 20) {
        // Case variations
        variations.push(word.toLowerCase());
        variations.push(word.toUpperCase());
        variations.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
        
        // Leetspeak substitutions
        let leet = word.toLowerCase();
        leet = leet.replace(/a/g, '4').replace(/e/g, '3').replace(/i/g, '1')
                  .replace(/o/g, '0').replace(/s/g, '5').replace(/t/g, '7');
        variations.push(leet);
        
        // Add common suffixes
        variations.push(word + '!');
        variations.push(word + '123');
        variations.push(word + '1');
        variations.push(word + '2024');
        variations.push('123' + word);
        variations.push('!' + word);
        
        // Reverse
        variations.push(word.split('').reverse().join(''));
      }
    }
    
    commonPasswords.push(...variations);

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
