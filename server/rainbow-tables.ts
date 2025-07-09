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
    // Comprehensive dictionary wordlist
    const commonPasswords = [
      // Empty and basic
      "", " ", "  ", "   ",
      
      // Top most common passwords
      "password", "123456", "123456789", "12345678", "12345", "1234567",
      "password123", "admin", "qwerty", "abc123", "Password1", "welcome",
      "monkey", "dragon", "letmein", "trustno1", "sunshine", "master",
      "hello", "world", "test", "user", "guest", "root", "toor", "pass",
      "secret", "love", "god", "sex", "money", "live", "forever", "cookie",

      // Common dictionary words (A-Z)
      "about", "above", "across", "action", "active", "actual", "after", "again",
      "against", "agree", "air", "alive", "all", "allow", "almost", "alone",
      "along", "already", "also", "although", "always", "among", "ancient",
      "and", "anger", "angle", "angry", "animal", "another", "answer", "any",
      "anyone", "anything", "appear", "apple", "approach", "area", "argue",
      "arm", "army", "around", "arrive", "art", "article", "ask", "attack",
      "attempt", "attention", "aunt", "autumn", "available", "average", "avoid",
      "away", "baby", "back", "bad", "bag", "ball", "band", "bank", "bar",
      "base", "basic", "battle", "be", "beach", "bear", "beat", "beautiful",
      "because", "become", "bed", "bedroom", "beer", "before", "began", "begin",
      "behavior", "behind", "believe", "below", "best", "better", "between",
      "beyond", "big", "bill", "bird", "birth", "bit", "bite", "black",
      "blind", "block", "blood", "blow", "blue", "board", "boat", "body",
      "bone", "book", "born", "both", "bottle", "bottom", "box", "boy",
      "brain", "branch", "brave", "bread", "break", "breakfast", "breath",
      "bridge", "brief", "bright", "bring", "broad", "broke", "brother",
      "brought", "brown", "build", "building", "burn", "bus", "business",
      "busy", "but", "buy", "by", "cake", "call", "calm", "came", "camera",
      "camp", "can", "cancer", "cannot", "cap", "capital", "car", "card",
      "care", "career", "careful", "carry", "case", "cat", "catch", "cause",
      "cell", "center", "central", "century", "certain", "certainly", "chair",
      "chance", "change", "character", "charge", "cheap", "check", "cheese",
      "chemical", "chest", "child", "choice", "choose", "church", "circle",
      "citizen", "city", "civil", "claim", "class", "classic", "clean",
      "clear", "clearly", "click", "client", "climb", "clock", "close",
      "clothes", "cloud", "club", "coach", "coast", "coat", "code", "coffee",
      "cold", "collect", "college", "color", "come", "comment", "common",
      "community", "company", "compare", "complete", "computer", "concept",
      "concern", "condition", "conference", "congress", "consider", "contain",
      "continue", "control", "cook", "cool", "copy", "corner", "correct",
      "cost", "could", "council", "count", "country", "county", "couple",
      "course", "court", "cover", "create", "crime", "crisis", "cross",
      "crowd", "cultural", "culture", "cup", "current", "customer", "cut",
      "cycle", "dad", "daily", "damage", "dance", "danger", "dangerous",
      "dark", "data", "date", "daughter", "day", "dead", "deal", "death",
      "debate", "decade", "decide", "decision", "deep", "defense", "degree",
      "democratic", "describe", "design", "despite", "detail", "determine",
      "develop", "development", "die", "difference", "different", "difficult",
      "dinner", "direction", "director", "discover", "discuss", "disease",
      "door", "doubt", "down", "draw", "dream", "dress", "drink", "drive",
      "drop", "drug", "during", "each", "early", "east", "easy", "eat",
      "economic", "economy", "edge", "education", "effect", "effort", "eight",
      "either", "election", "electric", "electronic", "element", "else",
      "email", "end", "energy", "engine", "enough", "enter", "entire",
      "environment", "equal", "equipment", "error", "escape", "especially",
      "establish", "even", "evening", "event", "ever", "every", "everyone",
      "everything", "evidence", "exactly", "example", "excellent", "except",
      "exchange", "exist", "expect", "experience", "explain", "eye", "face",
      "fact", "factor", "fail", "fair", "fall", "family", "famous", "far",
      "farm", "fast", "father", "fear", "feature", "federal", "feel",
      "feeling", "few", "field", "fight", "figure", "file", "fill", "film",
      "final", "finally", "financial", "find", "fine", "finger", "finish",
      "fire", "firm", "first", "fish", "five", "fix", "flag", "floor",
      "flow", "flower", "fly", "focus", "follow", "food", "foot", "for",
      "force", "foreign", "forget", "form", "former", "forward", "found",
      "four", "frame", "free", "freedom", "friend", "from", "front", "full",
      "fun", "function", "fund", "funny", "future", "game", "garden", "gas",
      "general", "generation", "get", "girl", "give", "glass", "global",
      "goal", "god", "gold", "good", "government", "great", "green", "ground",
      "group", "grow", "growth", "guard", "guess", "guest", "guide", "gun",
      "guy", "hair", "half", "hall", "hand", "handle", "hang", "happen",
      "happy", "hard", "hat", "hate", "have", "head", "health", "hear",
      "heart", "heat", "heavy", "help", "here", "herself", "high", "him",
      "himself", "his", "history", "hit", "hold", "hole", "home", "hope",
      "hospital", "hot", "hotel", "hour", "house", "how", "however", "huge",
      "human", "hundred", "husband", "idea", "identify", "image", "imagine",
      "impact", "important", "improve", "include", "including", "increase",
      "indeed", "indicate", "individual", "industry", "information", "inside",
      "instead", "institution", "interest", "interesting", "international",
      "interview", "into", "investment", "involve", "issue", "item", "its",
      "itself", "job", "join", "just", "keep", "key", "kid", "kill", "kind",
      "kitchen", "knee", "know", "knowledge", "land", "language", "large",
      "last", "late", "later", "laugh", "law", "lawyer", "lay", "lead",
      "leader", "learn", "least", "leave", "left", "leg", "legal", "less",
      "let", "letter", "level", "library", "lie", "life", "light", "like",
      "line", "list", "listen", "little", "live", "local", "long", "look",
      "lose", "loss", "lot", "love", "low", "machine", "magazine", "main",
      "maintain", "major", "make", "man", "manage", "management", "manager",
      "many", "market", "marriage", "material", "matter", "may", "maybe",
      "mean", "measure", "media", "medical", "meet", "meeting", "member",
      "memory", "mention", "message", "method", "middle", "might", "military",
      "million", "mind", "minute", "miss", "mission", "mistake", "model",
      "modern", "moment", "money", "month", "more", "morning", "most",
      "mother", "mouth", "move", "movement", "movie", "much", "music",
      "must", "my", "myself", "name", "nation", "national", "nature", "near",
      "nearly", "necessary", "need", "network", "never", "new", "news",
      "newspaper", "next", "nice", "night", "nine", "no", "nobody", "node",
      "none", "nor", "north", "not", "note", "nothing", "notice", "now",
      "number", "numerous", "object", "obtain", "obvious", "occur", "ocean",
      "odd", "of", "off", "offer", "office", "officer", "official", "often",
      "oil", "ok", "old", "on", "once", "one", "only", "onto", "open",
      "operation", "opportunity", "option", "or", "orange", "order",
      "organization", "other", "others", "our", "out", "outside", "over",
      "own", "owner", "page", "pain", "paint", "pair", "paper", "parent",
      "park", "part", "participant", "particular", "particularly", "partner",
      "party", "pass", "past", "path", "patient", "pattern", "pay", "peace",
      "people", "per", "perform", "performance", "perhaps", "period",
      "person", "personal", "phone", "physical", "pick", "picture", "piece",
      "place", "plan", "plant", "play", "player", "please", "plenty",
      "point", "police", "policy", "political", "politics", "poor", "popular",
      "population", "position", "positive", "possible", "power", "practice",
      "prepare", "present", "president", "pressure", "pretty", "prevent",
      "previous", "price", "primary", "prime", "principle", "print", "prior",
      "private", "probably", "problem", "process", "produce", "product",
      "production", "professional", "professor", "program", "project",
      "property", "protect", "prove", "provide", "public", "pull", "purpose",
      "push", "put", "quality", "question", "quick", "quickly", "quite",
      "race", "radio", "raise", "range", "rate", "rather", "rating", "reach",
      "read", "ready", "real", "reality", "realize", "really", "reason",
      "receive", "recent", "recently", "recognize", "record", "red", "reduce",
      "reflect", "region", "relate", "relationship", "religious", "remain",
      "remember", "remove", "report", "represent", "republican", "require",
      "research", "resource", "respond", "response", "responsibility", "rest",
      "result", "return", "reveal", "rich", "right", "rise", "risk", "river",
      "road", "rock", "role", "roll", "room", "rule", "run", "safe", "same",
      "save", "say", "scene", "school", "science", "score", "sea", "season",
      "seat", "second", "section", "security", "see", "seek", "seem", "sell",
      "send", "senior", "sense", "series", "serious", "serve", "service",
      "set", "seven", "several", "sex", "sexual", "shake", "shall", "shape",
      "share", "she", "shoot", "shopping", "short", "shot", "should", "shoulder",
      "show", "side", "sign", "significant", "similar", "simple", "simply",
      "since", "sing", "single", "sir", "sister", "sit", "site", "situation",
      "six", "size", "skill", "skin", "small", "smile", "so", "social",
      "society", "soldier", "some", "somebody", "someone", "something",
      "sometimes", "son", "song", "soon", "sort", "sound", "source", "south",
      "southern", "space", "speak", "special", "specific", "speech", "spend",
      "spent", "sport", "spring", "staff", "stage", "stand", "standard",
      "star", "start", "state", "statement", "station", "stay", "step",
      "still", "stock", "stop", "store", "story", "strategy", "street",
      "strong", "structure", "student", "study", "stuff", "style", "subject",
      "success", "successful", "such", "suddenly", "suffer", "suggest",
      "summer", "support", "sure", "surface", "system", "table", "take",
      "talk", "task", "tax", "teach", "teacher", "team", "technology", "tell",
      "ten", "tend", "term", "test", "than", "thank", "that", "the", "their",
      "them", "themselves", "then", "theory", "there", "these", "they",
      "thing", "think", "third", "this", "those", "though", "thought",
      "thousand", "threat", "three", "through", "throughout", "throw", "thus",
      "time", "to", "today", "together", "tonight", "too", "top", "total",
      "tough", "toward", "town", "trade", "traditional", "training", "travel",
      "treat", "treatment", "tree", "trial", "trip", "trouble", "true",
      "truth", "try", "turn", "tv", "two", "type", "under", "understand",
      "unit", "until", "up", "upon", "us", "use", "used", "useful", "user",
      "usually", "value", "various", "very", "victim", "view", "violence",
      "visit", "voice", "vote", "wait", "walk", "wall", "want", "war",
      "watch", "water", "way", "we", "weapon", "wear", "week", "weight",
      "well", "west", "western", "what", "whatever", "when", "where",
      "whether", "which", "while", "white", "who", "whole", "whom", "whose",
      "why", "wide", "wife", "will", "win", "wind", "window", "wish", "with",
      "within", "without", "woman", "wonder", "word", "work", "worker",
      "working", "world", "worry", "worse", "worst", "worth", "would",
      "write", "writer", "wrong", "yard", "yeah", "year", "yes", "yet",
      "you", "young", "your", "yourself",

      // Common names expanded
      "aaron", "adam", "alan", "albert", "alex", "alice", "amanda", "amy",
      "andrea", "andrew", "angela", "ann", "anna", "anne", "anthony", "antonio",
      "arthur", "ashley", "barbara", "betty", "beverly", "billy", "bobby",
      "brandon", "brian", "bruce", "carl", "carol", "carolyn", "catherine",
      "charles", "cheryl", "chris", "christina", "christine", "christopher",
      "cynthia", "daniel", "david", "deborah", "denise", "diane", "donald",
      "donna", "dorothy", "douglas", "edward", "elizabeth", "emily", "eric",
      "eugene", "evelyn", "frances", "frank", "gary", "george", "gerald",
      "gloria", "gregory", "harold", "harry", "helen", "henry", "howard",
      "irene", "jack", "jacqueline", "james", "janet", "janice", "jason",
      "jean", "jeffrey", "jennifer", "jeremy", "jerry", "jesse", "jessica",
      "joan", "joe", "john", "johnny", "jonathan", "jose", "joseph", "joshua",
      "joyce", "juan", "judith", "judy", "julia", "julie", "justin", "karen",
      "katherine", "kathleen", "kathryn", "kathy", "keith", "kelly", "kenneth",
      "kevin", "kimberly", "larry", "laura", "lawrence", "linda", "lisa",
      "lori", "louis", "louise", "margaret", "maria", "marie", "marilyn",
      "mark", "martha", "martin", "mary", "matthew", "melissa", "michael",
      "michelle", "nancy", "nicholas", "nicole", "norma", "pamela", "patricia",
      "patrick", "paul", "peter", "philip", "phillip", "rachel", "ralph",
      "raymond", "rebecca", "richard", "robert", "robin", "roger", "ronald",
      "rose", "roy", "ruby", "russell", "ruth", "ryan", "samuel", "sandra",
      "sara", "sarah", "scott", "sean", "sharon", "shirley", "stephanie",
      "stephen", "steve", "steven", "susan", "teresa", "terry", "theresa",
      "thomas", "timothy", "todd", "virginia", "walter", "wayne", "william",
      "willie", "zachary",

      // Colors
      "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown",
      "black", "white", "gray", "grey", "silver", "gold", "violet", "indigo",
      "cyan", "magenta", "maroon", "navy", "olive", "lime", "aqua", "teal",
      "fuchsia", "crimson", "scarlet", "azure", "beige", "coral", "ivory",
      "khaki", "lavender", "salmon", "tan", "turquoise",

      // Animals
      "dog", "cat", "bird", "fish", "horse", "cow", "pig", "sheep", "goat",
      "chicken", "duck", "goose", "turkey", "rabbit", "mouse", "rat", "hamster",
      "guinea", "ferret", "snake", "lizard", "turtle", "frog", "spider",
      "butterfly", "bee", "ant", "fly", "mosquito", "cricket", "ladybug",
      "beetle", "worm", "snail", "slug", "octopus", "squid", "crab", "lobster",
      "shrimp", "whale", "dolphin", "shark", "salmon", "tuna", "bass", "trout",
      "eagle", "hawk", "owl", "robin", "cardinal", "blue jay", "sparrow",
      "penguin", "ostrich", "peacock", "flamingo", "parrot", "canary",
      "elephant", "lion", "tiger", "bear", "wolf", "fox", "deer", "moose",
      "elk", "buffalo", "zebra", "giraffe", "hippopotamus", "rhinoceros",
      "monkey", "ape", "gorilla", "chimpanzee", "orangutan", "kangaroo",
      "koala", "panda", "sloth", "armadillo", "hedgehog", "porcupine",
      "squirrel", "chipmunk", "beaver", "otter", "seal", "walrus",

      // Food
      "pizza", "burger", "sandwich", "hot dog", "taco", "burrito", "pasta",
      "spaghetti", "pizza", "salad", "soup", "steak", "chicken", "fish",
      "rice", "bread", "cheese", "milk", "butter", "egg", "bacon", "ham",
      "sausage", "beef", "pork", "lamb", "turkey", "duck", "salmon", "tuna",
      "shrimp", "crab", "lobster", "apple", "banana", "orange", "grape",
      "strawberry", "blueberry", "raspberry", "blackberry", "cherry", "peach",
      "pear", "plum", "pineapple", "mango", "kiwi", "watermelon", "cantaloupe",
      "honeydew", "avocado", "tomato", "potato", "carrot", "onion", "garlic",
      "pepper", "cucumber", "lettuce", "spinach", "broccoli", "cauliflower",
      "cabbage", "celery", "corn", "peas", "beans", "lentils", "nuts",
      "almonds", "walnuts", "peanuts", "cashews", "pistachios", "chocolate",
      "vanilla", "strawberry", "mint", "lemon", "lime", "coconut", "coffee",
      "tea", "water", "juice", "soda", "beer", "wine", "whiskey", "vodka",
      "rum", "gin", "tequila", "brandy", "champagne", "cocktail",

      // Technology terms
      "computer", "laptop", "desktop", "tablet", "smartphone", "phone",
      "internet", "wifi", "bluetooth", "usb", "hdmi", "cable", "wireless",
      "network", "router", "modem", "server", "database", "software",
      "hardware", "application", "program", "code", "programming", "developer",
      "website", "webpage", "browser", "search", "google", "yahoo", "bing",
      "facebook", "twitter", "instagram", "youtube", "linkedin", "snapchat",
      "tiktok", "email", "gmail", "outlook", "yahoo mail", "apple", "microsoft",
      "google", "amazon", "netflix", "spotify", "uber", "lyft", "airbnb",
      "paypal", "venmo", "bitcoin", "cryptocurrency", "blockchain", "ai",
      "artificial intelligence", "machine learning", "data", "analytics",
      "cloud", "storage", "backup", "security", "firewall", "antivirus",
      "malware", "virus", "hacker", "password", "username", "login", "logout",
      "register", "signup", "account", "profile", "settings", "preferences",
      "notification", "alert", "message", "chat", "video", "audio", "music",
      "podcast", "streaming", "download", "upload", "file", "folder",
      "document", "pdf", "word", "excel", "powerpoint", "presentation",
      "spreadsheet", "calculator", "calendar", "clock", "timer", "alarm",
      "camera", "photo", "picture", "image", "video", "movie", "film",
      "game", "gaming", "console", "controller", "keyboard", "mouse",
      "monitor", "screen", "display", "speaker", "headphone", "microphone",
      "printer", "scanner", "fax", "copier", "battery", "charger", "power",
      "electricity", "energy", "solar", "wind", "nuclear", "oil", "gas",
      "coal", "renewable", "sustainable", "environment", "climate", "weather",
      "temperature", "humidity", "pressure", "wind", "rain", "snow", "ice",
      "sun", "moon", "stars", "planet", "earth", "mars", "venus", "jupiter",
      "saturn", "uranus", "neptune", "pluto", "galaxy", "universe", "space",
      "astronaut", "rocket", "satellite", "telescope", "science", "physics",
      "chemistry", "biology", "mathematics", "algebra", "geometry", "calculus",
      "statistics", "probability", "logic", "philosophy", "psychology",
      "sociology", "anthropology", "archaeology", "history", "geography",
      "politics", "government", "democracy", "republic", "monarchy", "dictatorship",
      "president", "prime minister", "king", "queen", "prince", "princess",
      "duke", "duchess", "lord", "lady", "sir", "madam", "mister", "miss",
      "mrs", "ms", "doctor", "professor", "teacher", "student", "pupil",
      "scholar", "researcher", "scientist", "engineer", "architect", "designer",
      "artist", "painter", "sculptor", "musician", "singer", "dancer",
      "actor", "actress", "director", "producer", "writer", "author",
      "poet", "journalist", "reporter", "editor", "publisher", "lawyer",
      "judge", "jury", "court", "trial", "verdict", "sentence", "prison",
      "jail", "police", "officer", "detective", "sheriff", "deputy",
      "firefighter", "paramedic", "nurse", "doctor", "surgeon", "dentist",
      "veterinarian", "pharmacist", "therapist", "counselor", "social worker",
      "teacher", "principal", "superintendent", "librarian", "secretary",
      "receptionist", "clerk", "cashier", "salesperson", "manager", "supervisor",
      "director", "president", "ceo", "cfo", "coo", "cto", "hr", "it",
      "marketing", "sales", "customer service", "support", "help", "assistance",
      "service", "maintenance", "repair", "installation", "construction",
      "building", "house", "home", "apartment", "condo", "townhouse",
      "mansion", "castle", "palace", "cottage", "cabin", "tent", "hotel",
      "motel", "inn", "resort", "restaurant", "cafe", "bar", "pub",
      "nightclub", "theater", "cinema", "museum", "library", "school",
      "university", "college", "hospital", "clinic", "pharmacy", "bank",
      "store", "shop", "mall", "market", "supermarket", "grocery", "bakery",
      "butcher", "florist", "bookstore", "clothing", "shoe", "jewelry",
      "electronics", "furniture", "hardware", "automotive", "gas station",
      "parking", "garage", "mechanic", "dealership", "rental", "lease",
      "mortgage", "loan", "credit", "debit", "cash", "check", "deposit",
      "withdrawal", "transfer", "payment", "bill", "invoice", "receipt",
      "tax", "fee", "charge", "cost", "price", "discount", "sale", "deal",
      "offer", "promotion", "coupon", "gift", "present", "birthday",
      "anniversary", "wedding", "graduation", "holiday", "vacation",
      "travel", "trip", "journey", "adventure", "exploration", "discovery",
      "experience", "memory", "moment", "time", "hour", "minute", "second",
      "day", "week", "month", "year", "decade", "century", "millennium",
      "past", "present", "future", "today", "yesterday", "tomorrow",
      "morning", "afternoon", "evening", "night", "midnight", "noon",
      "dawn", "dusk", "sunrise", "sunset", "spring", "summer", "autumn",
      "winter", "season", "weather", "climate", "temperature", "hot",
      "cold", "warm", "cool", "freezing", "boiling", "humid", "dry",
      "wet", "rainy", "snowy", "sunny", "cloudy", "foggy", "windy",
      "stormy", "calm", "peaceful", "quiet", "loud", "noisy", "silent",
      "sound", "music", "song", "melody", "rhythm", "beat", "tempo",
      "harmony", "chord", "note", "scale", "key", "instrument", "piano",
      "guitar", "violin", "drums", "trumpet", "saxophone", "flute",
      "clarinet", "oboe", "bassoon", "tuba", "harp", "organ", "keyboard",
      "synthesizer", "microphone", "speaker", "amplifier", "stereo",
      "radio", "cd", "dvd", "vinyl", "cassette", "mp3", "streaming",
      "concert", "performance", "show", "theater", "opera", "ballet",
      "dance", "choreography", "costume", "makeup", "stage", "curtain",
      "audience", "applause", "encore", "intermission", "act", "scene",
      "script", "dialogue", "monologue", "soliloquy", "character", "role",
      "plot", "story", "narrative", "theme", "genre", "comedy", "tragedy",
      "drama", "romance", "action", "adventure", "mystery", "thriller",
      "horror", "fantasy", "science fiction", "biography", "autobiography",
      "memoir", "novel", "short story", "poem", "poetry", "prose",
      "verse", "rhyme", "meter", "stanza", "line", "word", "sentence",
      "paragraph", "chapter", "book", "volume", "series", "collection",
      "anthology", "magazine", "newspaper", "journal", "article", "essay",
      "report", "review", "critique", "analysis", "commentary", "opinion",
      "editorial", "column", "feature", "news", "headline", "story",
      "interview", "profile", "portrait", "sketch", "drawing", "painting",
      "sculpture", "art", "artwork", "masterpiece", "gallery", "exhibition",
      "museum", "collection", "curator", "artist", "painter", "sculptor",
      "photographer", "designer", "architect", "engineer", "inventor",
      "creator", "maker", "builder", "constructor", "developer", "programmer",
      "coder", "hacker", "geek", "nerd", "expert", "professional", "specialist",
      "consultant", "advisor", "mentor", "coach", "trainer", "instructor",
      "guide", "leader", "manager", "supervisor", "boss", "chief",
      "executive", "officer", "director", "president", "chairman", "founder",
      "owner", "partner", "shareholder", "investor", "entrepreneur",
      "businessman", "businesswoman", "employee", "worker", "staff",
      "team", "group", "organization", "company", "corporation", "business",
      "enterprise", "firm", "agency", "institution", "foundation",
      "association", "society", "club", "union", "league", "federation",
      "alliance", "coalition", "partnership", "collaboration", "cooperation",
      "competition", "contest", "tournament", "championship", "game",
      "match", "race", "sport", "athletics", "exercise", "fitness",
      "health", "wellness", "medicine", "treatment", "therapy", "cure",
      "healing", "recovery", "rehabilitation", "prevention", "protection",
      "safety", "security", "defense", "guard", "shield", "armor",
      "weapon", "sword", "knife", "gun", "rifle", "pistol", "bullet",
      "bomb", "explosion", "fire", "flame", "smoke", "ash", "dust",
      "dirt", "soil", "earth", "ground", "floor", "ceiling", "wall",
      "door", "window", "roof", "foundation", "basement", "attic",
      "garage", "driveway", "yard", "garden", "lawn", "grass", "tree",
      "flower", "plant", "seed", "root", "stem", "leaf", "branch",
      "fruit", "vegetable", "herb", "spice", "seasoning", "flavor",
      "taste", "smell", "aroma", "fragrance", "perfume", "cologne",
      "soap", "shampoo", "conditioner", "lotion", "cream", "oil",
      "powder", "makeup", "lipstick", "mascara", "foundation", "blush",
      "eyeshadow", "eyeliner", "nail polish", "jewelry", "ring",
      "necklace", "bracelet", "earring", "watch", "glasses", "sunglasses",
      "hat", "cap", "helmet", "scarf", "gloves", "mittens", "socks",
      "shoes", "boots", "sandals", "sneakers", "heels", "flats",
      "shirt", "blouse", "sweater", "jacket", "coat", "dress", "skirt",
      "pants", "jeans", "shorts", "underwear", "bra", "panties",
      "boxers", "briefs", "pajamas", "nightgown", "robe", "towel",
      "blanket", "sheet", "pillow", "mattress", "bed", "bedroom",
      "bathroom", "kitchen", "dining room", "living room", "family room",
      "office", "study", "library", "closet", "storage", "pantry",
      "basement", "attic", "garage", "porch", "deck", "patio", "balcony",
      "yard", "garden", "lawn", "driveway", "sidewalk", "street",
      "road", "highway", "freeway", "bridge", "tunnel", "intersection",
      "traffic", "car", "truck", "bus", "taxi", "uber", "lyft",
      "motorcycle", "bicycle", "scooter", "skateboard", "roller skates",
      "ice skates", "skis", "snowboard", "sled", "boat", "ship",
      "yacht", "cruise", "ferry", "submarine", "airplane", "helicopter",
      "jet", "rocket", "spaceship", "train", "subway", "metro",
      "tram", "trolley", "cable car", "elevator", "escalator", "stairs",
      "ladder", "rope", "chain", "wire", "cable", "cord", "string",
      "thread", "yarn", "fabric", "cloth", "material", "textile",
      "cotton", "wool", "silk", "linen", "polyester", "nylon", "leather",
      "rubber", "plastic", "glass", "metal", "steel", "iron", "aluminum",
      "copper", "brass", "bronze", "silver", "gold", "platinum", "diamond",
      "ruby", "emerald", "sapphire", "pearl", "crystal", "stone",
      "rock", "marble", "granite", "concrete", "cement", "brick",
      "tile", "wood", "lumber", "plywood", "oak", "pine", "maple",
      "cherry", "walnut", "bamboo", "cork", "paper", "cardboard",
      "plastic", "foam", "sponge", "brush", "comb", "scissors",
      "knife", "fork", "spoon", "plate", "bowl", "cup", "glass",
      "bottle", "jar", "can", "box", "bag", "basket", "bucket",
      "pot", "pan", "skillet", "oven", "stove", "microwave", "toaster",
      "blender", "mixer", "processor", "refrigerator", "freezer",
      "dishwasher", "washer", "dryer", "vacuum", "mop", "broom",
      "dustpan", "sponge", "towel", "cloth", "detergent", "soap",
      "cleaner", "disinfectant", "bleach", "polish", "wax", "oil",
      "grease", "butter", "margarine", "oil", "vinegar", "salt",
      "pepper", "sugar", "honey", "syrup", "jam", "jelly", "peanut butter",
      "mayonnaise", "mustard", "ketchup", "sauce", "dressing", "spice",
      "herb", "garlic", "onion", "ginger", "basil", "oregano", "thyme",
      "rosemary", "sage", "parsley", "cilantro", "dill", "mint",
      "vanilla", "cinnamon", "nutmeg", "cloves", "allspice", "cardamom",
      "curry", "paprika", "chili", "cayenne", "black pepper", "white pepper",
      "red pepper", "green pepper", "yellow pepper", "orange pepper",
      "bell pepper", "jalapeno", "habanero", "serrano", "poblano",
      "chipotle", "ancho", "guajillo", "pasilla", "mulato", "cascabel",
      "chili powder", "cumin", "coriander", "fennel", "caraway",
      "sesame", "poppy", "sunflower", "pumpkin", "squash", "zucchini",
      "cucumber", "pickle", "olive", "avocado", "tomato", "potato",
      "sweet potato", "yam", "carrot", "beet", "radish", "turnip",
      "parsnip", "celery", "asparagus", "artichoke", "brussels sprouts",
      "cabbage", "lettuce", "spinach", "kale", "chard", "collard",
      "mustard", "watercress", "arugula", "endive", "radicchio",
      "chicory", "fennel", "leek", "scallion", "chive", "garlic",
      "onion", "shallot", "ginger", "turmeric", "horseradish", "wasabi"
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