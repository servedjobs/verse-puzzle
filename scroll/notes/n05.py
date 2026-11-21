exec(open(__file__.rsplit("/",1)[0] + "/_h.py").read())
H = {}
def PS(text):
    for l in text.strip().split("\n"):
        k, v = l.split("|", 1); H[k.strip()] = v.strip()
PS("""
1|Two ways are set side by side. The person who loves God's law is like a tree planted by water, and the wicked are like chaff blown away.
2|The nations plot against the Lord and his anointed king. God sets his king on Zion and says: you are my Son. Blessed are all who take refuge in him.
3|David prays while fleeing from his son Absalom. He lies down and sleeps in peace because the Lord sustains him.
4|An evening prayer. David asks God for relief from distress and says he will lie down in peace, for God alone makes him dwell in safety.
5|A morning prayer. David asks God to lead him in righteousness and says God hates evil but welcomes those who take refuge in him.
6|David is weak and troubled and asks God not to rebuke him in anger. He ends sure that the Lord has heard his weeping.
7|David appeals to God as the righteous judge against false accusations, and trusts that God will defend him.
8|God's name is majestic in all the earth. When David looks at the heavens, he asks: what is man that you remember him? God has given people charge over creation.
9|David thanks God for justice and for defending the poor. The second half asks why God seems far away while the wicked prey on the helpless, and ends sure that God hears the humble.
11|In the Lord I take refuge, David says. Though the foundations are shaken, the Lord is on his heavenly throne and sees everyone. He loves righteousness.
12|David cries for help because faithful people are vanishing and everyone speaks lies. The words of the Lord are pure, like silver refined seven times.
13|How long, Lord? David feels forgotten, but he trusts in God's steadfast love and ends by singing that God has been good to him.
14|The fool says in his heart that there is no God. No one does good by themselves. David longs for salvation to come out of Zion.
15|Who may live in God's tent? Those who walk blamelessly, do what is right, speak truth, and keep their word even when it hurts.
16|The Lord is my portion, David says. He will not abandon me to the grave. In God's presence there is fullness of joy.
17|David pleads for justice and asks God to guard him as the apple of his eye and hide him in the shadow of his wings.
18|A long song of thanks for rescue from enemies and from Saul. The Lord is my rock, my fortress, my deliverer. David describes God coming down to save him.
19|The heavens declare the glory of God. The law of the Lord is perfect, and is sweeter than honey. David asks to be kept from hidden faults.
20|The people pray for the king before battle. Some trust in chariots and some in horses, but we trust in the name of the Lord.
21|The king thanks God for victory and long life. His joy is in God's strength.
22|David cries out: My God, my God, why have you forsaken me? He describes terrible suffering and then turns to praise. Jesus quoted this psalm on the cross.
23|The Lord is my shepherd, I shall not want. He leads me beside still waters, walks with me through the valley of the shadow of death, and I will dwell in his house forever.
24|The earth is the Lord's and everything in it. Those with clean hands and a pure heart may go up his hill. Lift up your heads, O gates, that the King of glory may come in.
25|David lifts up his soul to God. He asks to be taught God's ways, to be forgiven, and to be rescued, and says that those who wait for the Lord are not put to shame.
26|David asks God to test his heart, says he has walked in integrity, and says he loves the place where God's glory dwells.
27|The Lord is my light and my salvation, whom shall I fear? One thing I ask: to live in God's house and see his beauty. Wait for the Lord and be strong.
28|David cries for help, and then thanks God: the Lord is my strength and my shield. He asks God to save his people and carry them forever.
29|The voice of the Lord thunders over the waters and shakes the wilderness. Give to the Lord the glory due his name. The Lord gives strength to his people and blesses them with peace.
30|David thanks God for healing him and lifting him out of the pit. Weeping may last for the night, but joy comes in the morning.
31|In you, O Lord, I take refuge. David is in distress and surrounded by plots, and prays: into your hand I commit my spirit. Jesus used these words on the cross.
32|Blessed is the one whose sin is forgiven. David says that while he kept silent his body wasted away, but when he confessed, God forgave him.
33|Sing to the Lord a new song. God made the heavens by his word and sees everything. The Lord delights in those who hope in his steadfast love.
34|Taste and see that the Lord is good. David praises God for rescuing him from fear. The Lord is near to the brokenhearted.
35|David asks God to fight for him against those who attack him without cause. He promises to give thanks in the great assembly.
36|The wicked plan evil, but God's steadfast love reaches to the heavens. With you is the fountain of life; in your light we see light.
37|Do not fret because of evildoers. Trust in the Lord, delight in him and wait patiently. The meek will inherit the land, and the Lord upholds the righteous.
38|David is suffering and knows his sin is part of the cause. He asks God not to rebuke him in anger and to come quickly to help.
39|David resolves to be quiet before the wicked. He then prays, reminding God that life is short, like a breath. His hope is in the Lord.
40|I waited patiently for the Lord, and he lifted me from the pit. I delight to do your will, O my God. Here I am, I have come to do your will.
41|Blessed is the one who cares for the poor. David is sick and betrayed by a close friend, but he trusts God to uphold him.
42|As the deer pants for streams of water, so my soul pants for you, O God. Why are you cast down, my soul? Hope in God.
43|David asks God to defend him and to send out his light and truth to lead him to God's holy hill. He says again: hope in God.
44|Israel remembers how God helped their ancestors, and now laments a defeat. They ask God to rise up and help them, for the sake of his steadfast love.
45|A song for the king's wedding. The king is praised for his justice, and the bride is told to forget her people and honor her husband.
46|God is our refuge and strength, a very present help in trouble. Be still, and know that I am God.
47|Clap your hands, all peoples. God is the great king over all the earth, and he sits on his holy throne.
48|Great is the Lord in the city of our God. The people walk around Zion, count its towers and tell the next generation that this God is our God forever.
49|No one can pay a ransom for another person's life. The rich die like everyone else, but God will redeem my soul from the grave.
50|God is the judge. He says he does not need bulls and goats. He asks for thanksgiving, keeping vows, and calling on him in trouble.
51|David's prayer of repentance after his sin with Bathsheba. Have mercy on me, O God. Create in me a clean heart and renew a right spirit within me.
52|David says the proud man who betrays others will be uprooted. David is like a green olive tree in God's house and trusts in his steadfast love.
53|This psalm repeats Psalm 14. The fool says there is no God, but God looks down from heaven and sees that no one does good.
54|David prays for help when the Ziphites betray him. God is my helper, he says, and the Lord is the upholder of my life.
55|David is troubled by his enemies and by a close friend who betrayed him. Cast your burden on the Lord, and he will sustain you.
56|When David is seized in Gath, he prays: when I am afraid, I put my trust in you. In God I trust, I will not fear.
57|Hiding in a cave from Saul, David prays: have mercy on me. In the shadow of your wings I take refuge. My heart is steadfast, I will sing and make music.
58|David says that unjust rulers speak lies and violence, but there is a God who judges on earth, and the righteous will be rewarded.
59|David prays to be rescued from enemies who watch his house. God is my fortress and the God who shows me steadfast love.
60|After a military defeat, the nation asks God to restore them. With God we shall do valiantly.
61|From the end of the earth I call to you when my heart is faint. Lead me to the rock that is higher than I.
62|My soul waits in silence for God alone. He is my rock, my salvation and my fortress. Power belongs to God, and so does steadfast love.
63|O God, you are my God. My soul thirsts for you in a dry land. Your steadfast love is better than life.
64|David asks God to protect him from secret plots. God will shoot an arrow at the wicked, and the righteous will rejoice.
65|Praise is due to God in Zion. He cares for the earth, waters it, and crowns the year with his bounty.
66|Shout for joy to God, all the earth. Come and see what God has done. He brought us through fire and water to a place of abundance.
67|May God be gracious to us and bless us, and let his face shine on us. Let all the peoples praise you.
68|Let God arise, and his enemies be scattered. He is father of the fatherless and protector of widows, and he leads Israel in triumph.
69|Save me, O God, for the waters have come up to my neck. Zeal for your house has consumed me. David cries for rescue and promises to praise God.
70|A short cry: make haste, O God, to deliver me. David asks God not to delay.
71|A prayer from someone in old age: do not cast me off when my strength is spent. God has been my hope since youth.
72|A prayer for the king to rule with justice and defend the poor. May he reign from sea to sea, and may all nations serve him.
73|Asaph nearly slips because he envies the wicked who prosper. He understands only when he enters God's sanctuary. God is my portion forever.
74|The temple has been destroyed and Asaph cries out: why have you rejected us? Remember your people and rise to defend your cause.
75|We give thanks to you, O God. God is the judge, who puts one down and lifts another up.
76|God is known in Judah and his name is great in Israel. He broke the arrows and made the proud soldiers sleep.
77|In distress I cry to God. Asaph remembers the years of the right hand of the Most High. You led your people like a flock.
78|A long history of Israel for the next generation. God did wonders in Egypt and the desert, and Israel kept rebelling. God chose David to shepherd his people.
79|The nations have defiled God's temple and left Jerusalem in ruins. Asaph asks God to help his people for the glory of his name.
80|Restore us, O God, let your face shine on us. Israel is like a vine brought out of Egypt, and the psalmist asks God to look down and care for it.
81|Sing for joy to God our strength. God reminds Israel that he brought them out of Egypt: open your mouth wide and I will fill it.
82|God stands in the council of the gods and judges them. Defend the weak and the fatherless. Rise up, O God, and judge the earth.
83|The enemies of Israel are plotting together to wipe out the nation. Asaph asks God to deal with them, so they will know that the Lord alone is the Most High.
84|How lovely is your dwelling place, O Lord of hosts. Better is one day in your courts than a thousand elsewhere. Blessed is the one who trusts in you.
85|Lord, you showed favor to your land. Steadfast love and faithfulness meet, and righteousness and peace kiss each other.
86|A prayer of David: you, Lord, are good and forgiving. Teach me your way and give me an undivided heart.
87|The Lord loves the gates of Zion. Glorious things are said of the city of God, where people of all nations are counted as born.
88|The darkest psalm. The writer cries out to God day and night but sees no relief, and the psalm ends without comfort, with darkness as his closest friend.
89|The psalm remembers God's covenant with David and his promise of a throne forever. Then it asks why God seems to have rejected his anointed king.
90|A prayer of Moses. Lord, you have been our dwelling place in all generations. Teach us to number our days, that we may gain a heart of wisdom.
91|He who dwells in the shelter of the Most High will rest in the shadow of the Almighty. God will command his angels to guard you.
92|It is good to give thanks to the Lord. The righteous flourish like the palm tree and still bear fruit in old age.
93|The Lord reigns, clothed in majesty. His throne is established from of old, and he is mightier than the roaring seas.
94|God of vengeance, shine forth. Rise up, judge of the earth. He who planted the ear, does he not hear? Blessed is the one you discipline, O Lord.
95|Come, let us sing to the Lord and kneel before him. Today, if you hear his voice, do not harden your hearts as at Meribah.
96|Sing to the Lord a new song. Declare his glory among the nations. Great is the Lord and greatly to be praised.
97|The Lord reigns, let the earth rejoice. Righteousness and justice are the foundation of his throne.
98|Sing to the Lord a new song, for he has done marvelous things. All the ends of the earth have seen his salvation.
99|The Lord reigns, let the peoples tremble. He is holy. Moses, Aaron and Samuel called on him, and he answered them.
100|Make a joyful noise to the Lord, all the earth. Know that the Lord is God. Enter his gates with thanksgiving and his courts with praise.
101|David promises to rule with integrity. He will not tolerate slander or pride, and he will look for faithful people.
102|A prayer of someone in affliction. The writer says his days vanish like smoke, but God will rebuild Zion. You remain the same, and your years have no end.
103|Bless the Lord, O my soul, and forget not all his benefits. He forgives all your sins and heals all your diseases. As far as the east is from the west, so far has he removed our sins.
104|A hymn praising God as creator. He sets the earth on its foundations, waters the hills and provides for every living thing. May the Lord rejoice in his works.
105|The psalm tells of God's wonders: his covenant with Abraham, Joseph in Egypt, the plagues, the Exodus, and the gift of the land. Israel is to keep his laws.
106|The psalm tells how Israel rebelled in Egypt and the desert, and still God remembered his covenant and heard their cry.
107|Give thanks to the Lord, for he is good. Let the redeemed of the Lord say so: those rescued from desert, prison, sickness and storm.
108|My heart is steadfast, O God. I will sing and make melody. With God we will do valiantly. This psalm joins parts of Psalms 57 and 60.
109|David prays against false accusers who repay his love with hatred. He asks God to stand at the right hand of the needy and save him.
110|The Lord says to my Lord: sit at my right hand. You are a priest forever, after the order of Melchizedek. The New Testament says this speaks of Christ.
111|Great are the works of the Lord. He is gracious and merciful. The fear of the Lord is the beginning of wisdom.
112|Blessed is the one who fears the Lord and delights in his commands. The righteous are generous and will be remembered forever.
113|Praise the Lord. Blessed be the name of the Lord from now on and forever. He raises the poor from the dust and gives the childless woman a home.
114|When Israel went out of Egypt, the sea saw it and fled, and the Jordan turned back. The second part says: not to us, O Lord, but to your name give glory, and says idols made by hands cannot speak or see.
116a|I love the Lord, because he has heard my voice. The cords of death entangled me, but the Lord saved me. I will walk before the Lord in the land of the living.
116b|I believed, even when I said I was greatly afflicted. What shall I render to the Lord for all his goodness? I will lift up the cup of salvation and call on the name of the Lord.
117|The shortest psalm. Praise the Lord, all nations. His steadfast love toward us is great, and his faithfulness endures forever.
118|Give thanks to the Lord, for he is good. The stone the builders rejected has become the cornerstone. This is the day the Lord has made, let us rejoice and be glad in it.
119|The longest psalm, in twenty-two sections, praises God's word. Your word is a lamp to my feet and a light to my path.
120|A song of ascents, sung on the way to Jerusalem. The writer is in distress among people who hate peace, and calls to the Lord.
121|I lift up my eyes to the hills. Where does my help come from? My help comes from the Lord, who made heaven and earth. He who keeps you will not slumber.
122|I was glad when they said to me: let us go to the house of the Lord. Pray for the peace of Jerusalem.
123|To you I lift up my eyes. As servants look to their master's hand, so we look to the Lord until he shows us mercy.
124|If the Lord had not been on our side, they would have swallowed us alive. We have escaped like a bird from a trap. Our help is in the name of the Lord.
125|Those who trust in the Lord are like Mount Zion, which cannot be moved. The Lord surrounds his people as the mountains surround Jerusalem.
126|When the Lord brought back the exiles, it was like a dream. Those who sow in tears will reap with songs of joy.
127|Unless the Lord builds the house, those who build it labor in vain. Children are a heritage from the Lord.
128|Blessed is everyone who fears the Lord and walks in his ways. Your wife will be like a fruitful vine and your children like olive shoots around your table.
129|Often since my youth they have attacked me, yet they have not prevailed. The Lord is righteous and has cut me free.
130|Out of the depths I cry to you, O Lord. If you kept a record of sins, who could stand? But with you there is forgiveness. Israel, hope in the Lord.
131|My heart is not proud, O Lord. I have calmed and quieted my soul, like a weaned child with its mother.
132|Lord, remember David and all his hardships. The Lord has chosen Zion as his resting place, and promises David a lasting dynasty.
133|How good and pleasant it is when brothers live together in unity. It is like oil poured on Aaron's head and like dew on Mount Hermon.
134|Bless the Lord, all you servants of the Lord who stand by night in his house. Lift up your hands in the sanctuary and bless the Lord.
135|Praise the name of the Lord. He is greater than all gods. The idols of the nations are silver and gold, made by human hands, and those who make them become like them.
136|Give thanks to the Lord, for he is good, for his steadfast love endures forever. Each line has the same refrain, as it tells of creation and the Exodus.
137|By the waters of Babylon we sat and wept, remembering Zion. How can we sing the Lord's song in a foreign land? If I forget you, O Jerusalem, may my right hand forget its skill.
138|I give thanks to you, O Lord, with my whole heart. Though the Lord is high, he looks on the lowly. The Lord will fulfill his purpose for me.
139|O Lord, you have searched me and known me. You know when I sit and when I rise. I praise you, for I am fearfully and wonderfully made. Search me and lead me in the way everlasting.
140|David prays to be rescued from violent people who plot evil and set traps. He trusts that God will defend the afflicted and the poor.
141|Let my prayer be counted as incense before you. David asks God to set a guard over his mouth and keep him from evil company.
142|David cries to the Lord from a cave, and says: no one cares for my soul. You are my refuge. Bring me out of prison.
143|Hear my prayer, O Lord. David says no one living is righteous before God. He asks to be taught to do God's will and to be led on level ground.
144|Blessed be the Lord, my rock, who trains my hands for war. David asks God to rescue him and describes a land of peace and plenty.
145|I will extol you, my God and King. The Lord is gracious and merciful, slow to anger and rich in love. The Lord is near to all who call on him.
146|Praise the Lord, O my soul. Do not put your trust in princes. The Lord keeps faith forever, lifts up those who are bowed down, and watches over the stranger.
147|Praise the Lord, for it is good to sing to our God. He heals the brokenhearted, counts the stars and gives them names, and sends snow and wind at his word.
148|Praise the Lord from the heavens and the earth. Sun, moon and stars, sea creatures, mountains, animals, kings and young and old, all are called to praise his name.
149|Sing to the Lord a new song. Let Israel rejoice in their Maker and praise his name with dancing. The Lord takes delight in his people.
150|Praise God in his sanctuary. Praise him with trumpet, harp, lyre, tambourine and cymbals. Let everything that has breath praise the Lord.
""")
def heb(n):
    if n <= 8 or n >= 148: return str(n)
    if n == 9: return "9"
    if n <= 112: return str(n + 1)
    if n == 113: return "114"
    if n == 114: return "116a"
    if n == 115: return "116b"
    if n <= 145: return str(n + 1)
    return "147"
N["Psalms"] = [H[heb(n)] for n in range(1, 151)]
