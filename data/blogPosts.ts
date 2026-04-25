export interface BlogPost {
	id: string;
	slug: string;
	title: string;
	bnTitle: string;
	excerpt: string;
	bnExcerpt: string;
	content: string;
	bnContent: string;
	coverImage: string;
	author: string;
	publishDate: string;
	readTime: string;
	keywords: string[];
	category: string;
}

export const BLOG_POSTS: BlogPost[] = [
	{
		id: 'metro-transport-culture-dhaka',
		slug: 'metro-transport-culture-dhaka',
		title: 'Dhaka Metro Rail: Not Just Fast Travel — A New Transport Culture',
		bnTitle: 'মেট্রোরেল: শুধু দ্রুত যাতায়াত নয়, এক নতুন ট্রান্সপোর্ট কালচার',
		excerpt: 'Metro Rail brought more than speed to Dhaka — it introduced a new civic culture of shared space, discipline, and smart commuting. Small habits can change the whole city.',
		bnExcerpt: 'মেট্রোরেল শুধু যাত্রা দ্রুত করেনি, এনেছে একটি নতুন ট্রান্সপোর্ট কালচার। ছোট ছোট অভ্যাস কীভাবে পুরো শহরের অভিজ্ঞতা বদলে দিতে পারে — সেটাই এই লেখার বিষয়।',
		coverImage: 'https://scontent.fdac190-1.fna.fbcdn.net/v/t39.30808-6/680629956_122125671375143278_6416898430983655453_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=101&ccb=1-7&_nc_sid=13d280&_nc_ohc=GgLkYVw2u0sQ7kNvwF4fPOy&_nc_oc=AdrZVaPwN2amxKvjOWKA5Y8R5OTDFIF552InAFXD_2tYCDxTJigYAFiRKltXk5iSkms&_nc_zt=23&_nc_ht=scontent.fdac190-1.fna&_nc_gid=rSx7akmdeWyxbXDaueC7FQ&_nc_ss=7b2a8&oh=00_Af1vTgTB7jiIh-lTMPWd5jdRKQRekU_OrAMF93bM9p_0Fw&oe=69F2CB31',
		content: `
Amid Dhaka's traffic, crowds, and uncertainty, Metro Rail has arrived as a kind of relief. It saves time and makes commuting easier. But Metro Rail isn't just a fast vehicle — it's introducing a new **transport culture** for our city.

This culture isn't built by infrastructure alone — it's built by our behavior.

---

## Why Is This a "Culture"?

Many of us notice it —
crowding at stations, disorder while boarding and alighting, blocking escalators by standing in the middle.

These may seem like small things, but they determine how smoothly a system will run.

The metro systems of developed cities work well not just because of technology — **but because of people's habits**.

---

## Small Habits, Big Change

### 1. Stand on the Left on Escalators, Keep the Right Side Clear

Those in a hurry can move quickly on the right side. This saves everyone's time.

### 2. Let Passengers Off First, Then Board

This is the most basic but most ignored rule.
When everyone gets the chance to exit, the entire process becomes faster.

### 3. Move Inside Instead of Crowding the Door

When people crowd the door, the entire queue gets blocked. Moving a little further in creates much more space.

### 4. Give Priority to Passengers Who Need It

Giving way to elderly, women, children, or physically challenged passengers — this isn't just a rule, it's humanity.

---

## Metro Is More Than Just Travel

Metro Rail is teaching us something new —
**how to move with discipline in a shared space.**

This goes beyond just the train itself — it can change the behavior of the whole city.

---

## Information + Behavior = A Better Journey

A good journey needs two things:

* Knowing the right route
* Moving the right way

For finding routes, we're often confused — which bus, which train, from where.

This is exactly where **KoyJabo (কই যাবো)** helps.
You can easily see which route gets you there fastest and with the least hassle.

And the points raised in this article make that journey even smoother.

---

## Final Thought

Metro Rail has handed us a good system.
How effective it will be now depends largely on us.

When we change small habits, the experience of the whole city can change.

---

🔗 [https://koyjabo.com](https://koyjabo.com)

#KoyJabo #DhakaMetro #Dhaka #PublicTransport #CivicSense
`,
		bnContent: `
ঢাকার ট্রাফিক, ভিড় আর অনিশ্চয়তার মাঝে মেট্রোরেল এসেছে এক ধরনের স্বস্তি নিয়ে। সময় বাঁচায়, যাত্রা সহজ করে। কিন্তু মেট্রোরেল শুধু একটা দ্রুত যানবাহন না — এটা আমাদের শহরের জন্য একটা নতুন **ট্রান্সপোর্ট কালচার**।

এই কালচারটা শুধু অবকাঠামো দিয়ে তৈরি হয় না, তৈরি হয় আমাদের আচরণ দিয়ে।

---

## কেন এটা "কালচার"?

আমরা অনেকেই খেয়াল করি —
স্টেশনে ভিড়, ট্রেনে উঠা-নামার সময় বিশৃঙ্খলা, এস্কেলেটরে জায়গা দখল করে দাঁড়িয়ে থাকা।

আসলে এগুলো ছোট বিষয় মনে হলেও, এগুলোই ঠিক করে দেয় একটা সিস্টেম কতটা স্মুথভাবে চলবে।

উন্নত শহরগুলোর মেট্রো সিস্টেম ভালো কাজ করে শুধু প্রযুক্তির জন্য না — **মানুষের অভ্যাসের জন্য**।

---

## কিছু ছোট অভ্যাস, বড় পরিবর্তন

### ১. এস্কেলেটরে বামে দাঁড়ান, ডান পাশ ফাঁকা রাখুন

যারা তাড়াহুড়ায় আছে তারা ডান পাশ দিয়ে দ্রুত যেতে পারবে। এতে সবার সময় বাঁচে।

### ২. আগে নামতে দিন, তারপর উঠুন

এটা সবচেয়ে বেসিক কিন্তু সবচেয়ে বেশি উপেক্ষিত নিয়ম।
যদি সবাই নামার সুযোগ পায়, পুরো প্রক্রিয়াটা দ্রুত হয়।

### ৩. দরজার সামনে না দাঁড়িয়ে ভেতরে যান

দরজার সামনে ভিড় হলেই পুরো লাইন ব্লক হয়ে যায়। একটু ভেতরে গেলে অনেক জায়গা তৈরি হয়।

### ৪. বিশেষ চাহিদাসম্পন্ন যাত্রীদের অগ্রাধিকার দিন

বয়স্ক, নারী, শিশু বা শারীরিকভাবে অসুবিধায় থাকা যাত্রীদের জন্য জায়গা ছেড়ে দেওয়া — এটা শুধু নিয়ম না, এটা মানবিকতা।

---

## মেট্রো ব্যবহার মানে শুধু ট্রাভেল না

মেট্রোরেল আমাদের একটা নতুন জিনিস শিখাচ্ছে —
**কিভাবে শেয়ারড স্পেসে শৃঙ্খলার সাথে চলতে হয়।**

এটা শুধু ট্রেনের ভেতরে না, পুরো শহরের আচরণ বদলাতে পারে।

---

## তথ্য + ব্যবহার = ভালো যাত্রা

একটা ভালো যাত্রার জন্য দুইটা জিনিস দরকার:

* সঠিক রুট জানা
* সঠিকভাবে চলাচল করা

রুট জানার জন্য আমরা অনেক সময় কনফিউজড থাকি — কোন বাস, কোন ট্রেন, কোথা থেকে।

এই জায়গাটায় **KoyJabo (কই যাবো)** সাহায্য করে।
আপনি সহজেই দেখতে পারেন কোন রুটে গেলে দ্রুত বা কম ঝামেলায় পৌঁছানো যাবে।

আর এই পোস্টে যেগুলো বললাম — এগুলো সেই যাত্রাটাকে আরও স্মুথ করে।

---

## শেষ কথা

মেট্রোরেল আমাদের হাতে একটা ভালো সিস্টেম তুলে দিয়েছে।
এখন এটা কতটা কার্যকর হবে, সেটা অনেকটাই নির্ভর করছে আমাদের উপর।

ছোট ছোট অভ্যাস বদলালে, পুরো শহরের অভিজ্ঞতা বদলে যেতে পারে।

---

🔗 [https://koyjabo.com](https://koyjabo.com)

#KoyJabo #DhakaMetro #Dhaka #PublicTransport #CivicSense
`,
		author: 'কই যাবো Team',
		publishDate: '2026-04-25',
		readTime: '4 min read',
		keywords: [
			'Dhaka Metro Rail culture', 'মেট্রোরেল', 'metro etiquette Dhaka',
			'MRT Line 6 tips', 'Dhaka public transport', 'metro rail Bangladesh',
			'civic sense metro', 'escalator etiquette', 'KoyJabo blog',
			'ঢাকা মেট্রো', 'transport culture Bangladesh', 'metro commute Dhaka'
		],
		category: 'Metro Rail'
	}
];
