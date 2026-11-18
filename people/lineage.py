# Family lines for the Who's Who map: everyone traced back to Adam and Eve, and to Jesus.
# UP[id] = (parent_id, label, gap)  label = how they're related; gap = note when the Bible skips generations.
# Names used only in family lines (not tappable people) live in NAMES.

NAMES = {
 "enosh": "Enosh", "kenan": "Kenan", "mahalalel": "Mahalalel", "jared": "Jared", "enoch": "Enoch",
 "methuselah": "Methuselah", "lamech": "Lamech", "shem": "Shem", "ham": "Ham", "japheth": "Japheth",
 "arphaxad": "Arphaxad", "shelah": "Shelah", "eber": "Eber", "peleg": "Peleg", "reu": "Reu", "serug": "Serug",
 "nahor": "Nahor", "terah": "Terah", "nahor2": "Nahor (Abraham’s brother)", "haran": "Haran (Abraham’s brother)",
 "bethuel": "Bethuel", "perez": "Perez", "hezron": "Hezron", "ram": "Ram", "amminadab": "Amminadab",
 "nahshon": "Nahshon", "salmon": "Salmon", "rehoboam": "Rehoboam", "abijah": "Abijah", "asa": "Asa",
 "jehoshaphat": "Jehoshaphat", "joram": "Joram", "uzziah": "Uzziah", "jotham": "Jotham", "ahaz": "Ahaz",
 "manasseh-k": "Manasseh", "amon": "Amon", "jeconiah": "Jeconiah", "shealtiel": "Shealtiel",
 "zerubbabel": "Zerubbabel", "abiud": "Abiud", "eliakim": "Eliakim", "azor": "Azor", "zadok": "Zadok",
 "achim": "Achim", "eliud": "Eliud", "eleazar": "Eleazar", "matthan": "Matthan", "jacob2": "Jacob (Joseph’s father)",
 "levi": "Levi", "kohath": "Kohath", "amram": "Amram", "ephraim": "Ephraim", "manasseh": "Manasseh (Joseph’s son)",
 "dan": "Dan", "naphtali": "Naphtali", "zebulun": "Zebulun", "kish": "Kish", "nathan-son": "Nathan (David’s son)",
 "canaan": "Canaan", "mizraim": "Mizraim (Egypt)", "moab": "Moab", "midian": "Midian", "sidon": "Sidon",
 "elkanah": "Elkanah",
}

SPINE = ["adam-eve", "seth", "enosh", "kenan", "mahalalel", "jared", "enoch", "methuselah", "lamech", "noah",
 "shem", "arphaxad", "shelah", "eber", "peleg", "reu", "serug", "nahor", "terah", "abraham", "isaac", "jacob",
 "judah", "perez", "hezron", "ram", "amminadab", "nahshon", "salmon", "boaz", "obed", "jesse", "david",
 "solomon", "rehoboam", "abijah", "asa", "jehoshaphat", "joram", "uzziah", "jotham", "ahaz", "hezekiah",
 "manasseh-k", "amon", "josiah", "jeconiah", "shealtiel", "zerubbabel", "abiud", "eliakim", "azor", "zadok",
 "achim", "eliud", "eleazar", "matthan", "jacob2", "joseph-nazareth", "jesus"]

UP = {}
for a, b in zip(SPINE, SPINE[1:]):
    UP[b] = (a, "son", "")
UP["joram"] = ("jehoshaphat", "son", "")
UP["uzziah"] = ("joram", "descendant", "Matthew’s list skips three kings here (Ahaziah, Joash and Amaziah).")
UP["jesus"] = ("joseph-nazareth", "legal son", "Joseph was Jesus’ legal father. Jesus was born of Mary by the Holy Spirit.")
UP["joseph-nazareth"] = ("jacob2", "son", "")

ISRAEL = "A Jewish man or woman. The Bible doesn’t give the exact family line, but every Israelite comes from Jacob (Israel)."
NATIONS = "The Bible doesn’t give the exact family line, but it says every nation on earth came from Noah’s three sons (Genesis 10)."

def g(pid, parent, label="descendant", gap=""):
    UP[pid] = (parent, label, gap)

# Side branches off the main line
g("ham", "noah", "son"); g("japheth", "noah", "son")
g("canaan", "ham", "son"); g("mizraim", "ham", "son"); g("sidon", "canaan", "son")
g("nahor2", "terah", "son"); g("haran", "terah", "son"); g("bethuel", "nahor2", "son")
g("lot", "haran", "son"); g("moab", "lot", "son"); g("midian", "abraham", "son", "Born to Abraham and his later wife Keturah (Genesis 25).")
g("levi", "jacob", "son"); g("kohath", "levi", "son"); g("amram", "kohath", "son")
g("ephraim", "joseph-egypt", "son"); g("manasseh", "joseph-egypt", "son")
g("dan", "jacob", "son"); g("naphtali", "jacob", "son"); g("zebulun", "jacob", "son")
g("nathan-son", "david", "son"); g("kish", "benjamin", "descendant", "Many generations later.")

# The beginning
g("cain-abel", "adam-eve", "sons"); g("seth", "adam-eve", "son")
g("sarah", "terah", "daughter", "Abraham’s half-sister: same father, different mother (Genesis 20:12).")
g("rebekah", "bethuel", "daughter"); g("laban", "bethuel", "son")
g("rachel", "laban", "daughter"); g("leah", "laban", "daughter")
g("esau", "isaac", "son"); g("ishmael", "abraham", "son", "His mother was Hagar.")
g("hagar", "mizraim", "descendant", "She was an Egyptian. Egypt’s people came from Mizraim, Noah’s grandson.")
g("joseph-egypt", "jacob", "son"); g("benjamin", "jacob", "son")
# Exodus
g("jochebed", "levi", "daughter")
for x in ("moses", "aaron", "miriam"): g(x, "amram", "son" if x != "miriam" else "daughter")
g("jethro", "midian", "descendant", "He was a priest of Midian; the Midianites came from Abraham’s son Midian.")
g("zipporah", "jethro", "daughter")
g("joshua", "ephraim", "descendant", "Son of Nun, from the tribe of Ephraim (Numbers 13:8).")
g("caleb", "judah", "descendant", "Son of Jephunneh, from the tribe of Judah (Numbers 13:6).")
g("rahab", "canaan", "descendant", "She was a Canaanite from Jericho. The Canaanites came from Canaan, Noah’s grandson.")
g("pharaoh", "mizraim", "descendant", "The kings of Egypt. Egypt’s people came from Mizraim, Noah’s grandson.")
# Judges and Ruth
g("deborah", "jacob", "descendant", "The Bible doesn’t name her tribe. She judged Israel in the hill country of Ephraim.")
g("barak", "naphtali", "descendant", "Son of Abinoam, from the tribe of Naphtali (Judges 4:6).")
g("jael", "noah", "descendant", "Her own family isn’t given. Her husband Heber was a Kenite, a people related to Moses’ father-in-law.")
g("sisera", "noah", "descendant", "A Canaanite general. " + NATIONS)
g("gideon", "manasseh", "descendant", "Son of Joash, from the tribe of Manasseh (Judges 6:15).")
g("manoah", "dan", "descendant", "From the tribe of Dan (Judges 13:2).")
g("samson", "manoah", "son")
g("delilah", "noah", "descendant", "The Bible doesn’t say who her people were. " + NATIONS)
g("ruth", "moab", "descendant", "She was a Moabite. The Moabites came from Moab, the son of Abraham’s nephew Lot.")
g("naomi", "judah", "descendant", "She was from Bethlehem in Judah.")
g("hannah", "jacob", "descendant", ISRAEL)
g("elkanah", "levi", "descendant", "1 Chronicles 6 lists Elkanah’s family among the Levites.")
g("samuel", "elkanah", "son", "His mother was Hannah.")
g("eli", "aaron", "descendant", "All of Israel’s priests came from Aaron.")
# Kings
g("saul", "kish", "son"); g("jonathan", "saul", "son"); g("michal", "saul", "daughter")
g("bathsheba", "jacob", "descendant", "Daughter of Eliam (2 Samuel 11:3). " + ISRAEL)
g("uriah", "canaan", "descendant", "He was a Hittite. The Hittites came from Heth, a son of Canaan (Genesis 10:15).")
g("nathan", "jacob", "descendant", ISRAEL)
g("absalom", "david", "son")
g("queen-sheba", "noah", "descendant", "The Bible doesn’t say exactly which of Noah’s sons her people came from.")
g("ahab", "jacob", "descendant", "Son of Omri, king of Israel. " + ISRAEL)
g("jezebel", "sidon", "descendant", "A princess of Sidon. Sidon was the firstborn son of Canaan (Genesis 10:15).")
g("esther", "benjamin", "descendant", "She was from the tribe of Benjamin, like her cousin Mordecai (Esther 2:5-7).")
g("mordecai", "benjamin", "descendant", "Son of Jair, son of Shimei, son of Kish, from the tribe of Benjamin (Esther 2:5).")
g("haman", "esau", "descendant", "The Bible calls him an Agagite. The Bible doesn’t say exactly, but tradition has said this means he came from Agag, king of the Amalekites, who came from Esau.")
g("xerxes", "noah", "descendant", "King of Persia. " + NATIONS)
g("nebuchadnezzar", "noah", "descendant", "King of Babylon. " + NATIONS)
g("goliath", "mizraim", "descendant", "A Philistine from Gath. Genesis 10:14 says the Philistines came from Mizraim’s family.")
# Prophets
g("elijah", "jacob", "descendant", "From Tishbe in Gilead. " + ISRAEL)
g("elisha", "jacob", "descendant", "Son of Shaphat. " + ISRAEL)
g("isaiah", "jacob", "descendant", "Son of Amoz. " + ISRAEL)
g("jeremiah", "aaron", "descendant", "Son of Hilkiah, from the priests of Anathoth (Jeremiah 1:1). All priests came from Aaron.")
g("daniel", "judah", "descendant", "From the tribe of Judah, of a noble family (Daniel 1:3-6).")
g("shadrach", "judah", "descendant", "From the tribe of Judah (Daniel 1:6).")
g("jonah", "zebulun", "descendant", "Son of Amittai, from Gath-hepher in Zebulun’s land (2 Kings 14:25).")
g("job", "noah", "descendant", "He lived in the land of Uz. The Bible doesn’t give his family line.")
# New Testament
g("zechariah", "aaron", "descendant", "A priest, so a descendant of Aaron (Luke 1:5).")
g("elizabeth", "aaron", "descendant", "Luke 1:5 says she was “of the daughters of Aaron.”")
g("john-baptist", "zechariah", "son", "His mother was Elizabeth.")
g("mary", "nathan-son", "descendant", "The Bible says Jesus came from David’s family through His birth (Romans 1:3). The Bible doesn’t say exactly, but tradition has said Luke 3 gives Mary’s family line, through David’s son Nathan.")
g("zebedee", "jacob", "descendant", ISRAEL)
g("james-zebedee", "zebedee", "son"); g("john", "zebedee", "son")
for x in ("peter", "andrew", "philip", "bartholomew", "thomas", "matthew", "james-alphaeus", "jude-thaddaeus",
          "simon-zealot", "judas", "matthias", "mary-magdalene", "martha-mary", "lazarus", "nicodemus",
          "joseph-arimathea", "stephen", "priscilla-aquila", "mark", "silas", "apollos", "lois-eunice"):
    g(x, "jacob", "descendant", ISRAEL)
g("zacchaeus", "abraham", "descendant", "Jesus Himself called him “a son of Abraham” (Luke 19:9).")
g("paul", "benjamin", "descendant", "Paul said he was “of the tribe of Benjamin” (Philippians 3:5).")
g("barnabas", "levi", "descendant", "A Levite from Cyprus (Acts 4:36).")
g("timothy", "lois-eunice", "son", "His mother Eunice was Jewish; his father was Greek (Acts 16:1).")
g("lydia", "noah", "descendant", "A businesswoman from Thyatira who worshiped God. " + NATIONS)
g("luke", "noah", "descendant", "The Bible doesn’t say exactly, but tradition has said Luke was not Jewish. " + NATIONS)
g("herod", "esau", "descendant", "Herod’s family were Idumeans, that is, Edomites, who came from Esau.")
g("herod-antipas", "herod", "son")
g("caiaphas", "aaron", "descendant", "The high priest, so a descendant of Aaron.")
g("pilate", "noah", "descendant", "A Roman governor. " + NATIONS)

# Ancestors of Jesus who married into the line: show their child on the way to Jesus
DOWN = {"sarah": "isaac", "rebekah": "jacob", "leah": "judah", "rahab": "boaz", "ruth": "obed",
        "bathsheba": "solomon", "mary": "jesus"}

# How each person relates to Jesus, in one plain sentence
JNOTE = {
 "adam-eve": "Jesus is called “the last Adam”: Adam brought death, Jesus brings life (1 Corinthians 15:45).",
 "cain-abel": "Jesus comes from their younger brother Seth. Jesus spoke of “righteous Abel” (Matthew 23:35).",
 "seth": "Jesus’ family line runs through Seth (Luke 3:38).",
 "noah": "Jesus is Noah’s descendant. Jesus said His return would be “as in the days of Noah.”",
 "abraham": "God promised Abraham that all nations would be blessed through his family. That promise came true in Jesus.",
 "sarah": "Her son Isaac is in Jesus’ family line.",
 "isaac": "Jesus’ ancestor. Isaac carrying the wood up the mountain points ahead to Jesus carrying His cross.",
 "jacob": "Jesus’ ancestor. Jesus said He is the “ladder” Jacob dreamed of (John 1:51).",
 "judah": "Jesus is from the tribe of Judah and is called “the Lion of the tribe of Judah.”",
 "rebekah": "Her son Jacob is in Jesus’ family line.", "leah": "Her son Judah is in Jesus’ family line.",
 "rahab": "She is named in Jesus’ family list in Matthew 1:5.", "ruth": "She is named in Jesus’ family list in Matthew 1:5.",
 "boaz": "Jesus’ ancestor, and a picture of Him: a “redeemer” who rescues.", "obed": "Jesus’ ancestor.",
 "jesse": "Isaiah said the Messiah would be “a shoot from the stump of Jesse.”",
 "david": "Jesus is called “the Son of David.” God promised David a King who would reign forever.",
 "solomon": "Jesus’ ancestor. Jesus said, “Something greater than Solomon is here.”",
 "bathsheba": "Her son Solomon is in Jesus’ family line (Matthew 1:6).",
 "hezekiah": "Jesus’ ancestor (Matthew 1:9).", "josiah": "Jesus’ ancestor (Matthew 1:10).",
 "joseph-nazareth": "Jesus’ legal father, who raised Him.", "mary": "Jesus’ mother.",
 "jesus": "This is Jesus Himself, the end of the line all these names were leading to.",
 "john-baptist": "Jesus’ relative. Their mothers, Elizabeth and Mary, were related (Luke 1:36).",
 "elizabeth": "Mary’s relative, so Jesus’ relative (Luke 1:36).", "zechariah": "Husband of Mary’s relative Elizabeth.",
 "moses": "Moses spoke about Jesus’ coming (John 5:46) and talked with Him at the Transfiguration.",
 "elijah": "Elijah talked with Jesus at the Transfiguration.",
 "isaiah": "Isaiah foretold Jesus’ birth and His suffering for our sins (Isaiah 53).",
 "jonah": "Jesus said His three days in the tomb were “the sign of Jonah.”",
 "herod": "He tried to kill baby Jesus in Bethlehem.", "herod-antipas": "He mocked Jesus on the day He died.",
 "pilate": "He sentenced Jesus to be crucified.", "caiaphas": "The high priest who put Jesus on trial.",
 "judas": "One of the Twelve, who betrayed Jesus.",
 "mary-magdalene": "The first person to see Jesus risen.", "martha-mary": "Close friends of Jesus.",
 "lazarus": "Jesus’ friend, whom He raised from the dead.", "nicodemus": "He came to Jesus by night and helped bury Him.",
 "zacchaeus": "Jesus came to his house and said, “Today salvation has come.”",
 "joseph-arimathea": "He buried Jesus in his own tomb.",
 "paul": "He met the risen Jesus on the road to Damascus.", "stephen": "He saw Jesus standing at God’s right hand as he died.",
}
for x in ("peter", "andrew", "james-zebedee", "john", "philip", "bartholomew", "thomas", "matthew", "james-alphaeus",
          "jude-thaddaeus", "simon-zealot"):
    JNOTE.setdefault(x, "One of Jesus’ twelve apostles.")
JNOTE.setdefault("matthias", "Chosen to replace Judas as one of the Twelve after Jesus rose.")
