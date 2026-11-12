// Speaking Lab content
export const OPEN_Q = [
  { level: 'A1', q: 'What do you usually do on Saturdays?', es: '¿Qué sueles hacer los sábados?', useful: ['I usually', 'in the morning', 'with my friends'], model: 'On Saturdays I usually get up late. In the morning I go for a walk, and in the evening I meet my friends.', minWords: 12 },
  { level: 'A1', q: 'Describe your house or flat.', es: 'Describe tu casa o piso.', useful: ['There is', 'There are', 'my favourite room'], model: 'I live in a small flat in the city centre. There are two bedrooms and a little balcony. My favourite room is the kitchen because I love cooking.', minWords: 15 },
  { level: 'A2', q: 'What was the best holiday you’ve had?', es: '¿Cuál ha sido tu mejor viaje?', useful: ['I went to', 'it was', 'the best part was'], model: 'The best holiday I’ve had was in Sicily. I went with my friends two years ago. The food was incredible and the best part was swimming at sunset.', minWords: 20 },
  { level: 'A2', q: 'Tell me about someone you admire.', es: 'Háblame de alguien a quien admires.', useful: ['I really admire', 'because', 'she always'], model: 'I really admire my grandmother because she raised five children and always stayed positive. She always says that problems look smaller after a good meal.', minWords: 20 },
  { level: 'B1', q: 'What’s something you’ve changed your mind about recently?', es: '¿Sobre qué has cambiado de opinión últimamente?', useful: ['I used to think', 'but now', 'what changed my mind was'], model: 'I used to think running was boring, but now I love it. What changed my mind was joining a running club — the social side makes all the difference.', minWords: 25 },
  { level: 'B1', q: 'If you could live in any country for a year, where would you go and why?', es: 'Si pudieras vivir un año en cualquier país…', useful: ['I would', 'because', 'I’ve always wanted to'], model: 'I’d go to Canada, because I’ve always wanted to experience a real winter. I would also love to improve my English and maybe learn to ski.', minWords: 25 },
  { level: 'B2', q: 'Is it better to have a job you love or a job that pays well?', es: '¿Mejor un trabajo que te guste o uno bien pagado?', useful: ['It depends on', 'On the one hand', 'On the other hand', 'Personally'], model: 'It depends on your situation. On the one hand, a well-paid job gives you security. On the other hand, spending forty hours a week doing something you hate is exhausting. Personally, I’d look for a balance.', minWords: 40, seconds: 60 },
  { level: 'B2', q: 'How has technology changed the way people make friends?', es: '¿Cómo ha cambiado la tecnología la forma de hacer amigos?', useful: ['nowadays', 'whereas', 'the downside is'], model: 'Nowadays you can meet people with the same interests anywhere in the world, whereas before you were limited to your town. The downside is that some friendships stay quite superficial.', minWords: 40, seconds: 60 },
  { level: 'C1', q: 'To what extent should governments regulate social media?', es: '¿Hasta qué punto deberían los gobiernos regular las redes sociales?', useful: ['to a certain extent', 'arguably', 'the crux of the matter'], model: 'To a certain extent, regulation is necessary, particularly to protect minors. Arguably, though, the crux of the matter is transparency: we need to know how algorithms decide what we see.', minWords: 50, seconds: 90 },
  { level: 'C1', q: 'What makes a city truly liveable?', es: '¿Qué hace que una ciudad sea realmente habitable?', useful: ['first and foremost', 'what really matters', 'it’s not just about'], model: 'First and foremost, it’s about time: how long it takes to get to work, to a park, to a friend’s house. It’s not just about money or nightlife — what really matters is everyday quality of life.', minWords: 50, seconds: 90 },
];

export const QUICK = [
  'What did you have for breakfast?', 'What’s your favourite season and why?', 'Coffee or tea?', 'Describe your best friend in three words.', 'What’s the last film you saw?',
  'Where would you like to be right now?', 'What’s your earliest memory?', 'Cats or dogs?', 'What app do you use the most?', 'What’s something you’re good at?',
  'What’s the weather like today?', 'Describe your perfect weekend.', 'What’s a skill you’d like to learn?', 'What annoys you the most?', 'What’s your favourite food?',
  'Beach or mountains?', 'What did you do last night?', 'What would you do with an extra hour every day?', 'What’s your dream job?', 'Who do you text the most?',
];

export const STORY = [
  { q: 'Tell me about a time you got lost.', useful: ['It was', 'suddenly', 'luckily', 'in the end'], minWords: 40, seconds: 90 },
  { q: 'Tell me about the most embarrassing moment of your life.', useful: ['I’ll never forget', 'I was so embarrassed', 'everyone started'], minWords: 40, seconds: 90 },
  { q: 'Describe a day when everything went wrong.', useful: ['First of all', 'to make things worse', 'by the end of the day'], minWords: 40, seconds: 90 },
  { q: 'Tell me about a trip that changed you.', useful: ['It made me realise', 'looking back', 'since then'], minWords: 40, seconds: 90 },
  { q: 'Describe a time you helped a stranger.', useful: ['I noticed', 'so I decided to', 'it turned out'], minWords: 40, seconds: 90 },
];

export const DEBATES = [
  { q: 'Should homework be banned in primary schools?', for: ['Children need time to play', 'It increases stress at home', 'It widens inequality'], against: ['It builds discipline', 'Parents see what children learn', 'Practice helps memory'], useful: ['I firmly believe', 'On the contrary', 'That’s a fair point, but'] },
  { q: 'Is it better to rent or to buy a home?', for: ['Buying builds long-term wealth', 'You can make it your own'], against: ['Renting gives flexibility', 'No maintenance costs', 'Easier to move for work'], useful: ['In the long run', 'It depends on', 'The main advantage is'] },
  { q: 'Should tourists pay extra to visit popular cities?', for: ['Funds public services', 'Reduces overtourism'], against: ['Hurts small businesses', 'Makes travel elitist'], useful: ['Admittedly', 'That said', 'It’s a double-edged sword'] },
  { q: 'Will AI make jobs better or worse?', for: ['Removes boring tasks', 'Creates new types of jobs'], against: ['Some jobs disappear', 'Workers need retraining'], useful: ['In my view', 'There’s no doubt that', 'At the same time'] },
  { q: 'Should flying be more expensive to protect the environment?', for: ['Flights produce high emissions per person', 'Encourages trains'], against: ['Travel becomes only for the rich', 'Islands depend on flights'], useful: ['To be fair', 'The way I see it', 'We can’t ignore'] },
];

export const IMPROV = [
  'You’re at a restaurant and the waiter brings you the wrong dish. You’re in a hurry.',
  'Your neighbour is having a loud party at 2 am. Knock on the door and talk to them.',
  'You’ve arrived at your hotel, but they say they have no record of your booking.',
  'You bumped into your ex at the supermarket. Make small talk.',
  'A tourist asks you for a restaurant recommendation in your city.',
  'Your flight has been cancelled. Talk to the airline agent and get a solution.',
  'You need to convince your friend to come to a concert they don’t want to go to.',
  'Your boss asks you to work this weekend, but you have plans. Say no politely.',
  'You’re lost in London and your phone is dead. Ask for help.',
  'A shop assistant refuses to give you a refund without a receipt.',
];

// Picture descriptions: simple illustrated scenes (inline SVG in the view)
export const PICTURES = [
  { id: 'beach', title: 'A day at the beach', useful: ['In the foreground', 'In the background', 'It looks like', 'they seem to be'], model: 'It looks like a sunny day at the beach. In the foreground there’s a couple under an umbrella, and in the background a sailing boat is crossing the sea. They seem to be relaxing.' },
  { id: 'cafe', title: 'Morning at the café', useful: ['There is / there are', 'on the left', 'probably', 'I imagine'], model: 'This is a cosy café. On the left, a barista is making coffee, and there’s a customer working on a laptop. It’s probably early in the morning.' },
  { id: 'airport', title: 'At the departure gate', useful: ['It seems that', 'waiting for', 'might be', 'in the distance'], model: 'It seems that passengers are waiting for their flight. One person is checking the screen, and in the distance a plane is taking off. They might be delayed.' },
];

// Virtual characters: scripted conversation partners (not AI). They take you through a role-play using
// Everyday English scenarios. See README for how to connect a real conversational AI.
export const CHARACTERS = [
  { id: 'emma', name: 'Emma', from: 'London, UK', accent: 'en-GB', role: 'Friendly neighbour', scenario: 'smalltalk', color: 'coral' },
  { id: 'jake', name: 'Jake', from: 'Chicago, USA', accent: 'en-US', role: 'Barista', scenario: 'ordering', color: 'blue' },
  { id: 'chloe', name: 'Chloe', from: 'Melbourne, Australia', accent: 'en-AU', role: 'Hostel receptionist', scenario: 'hotel', color: 'mint' },
  { id: 'liam', name: 'Liam', from: 'Dublin, Ireland', accent: 'en-IE', role: 'Local in the street', scenario: 'directions', color: 'amber' },
  { id: 'olivia', name: 'Olivia', from: 'Manchester, UK', accent: 'en-GB', role: 'HR Manager', scenario: 'interviews', color: 'violet' },
  { id: 'noah', name: 'Noah', from: 'Toronto, Canada', accent: 'en-CA', role: 'New colleague', scenario: 'workstudy', color: 'blue' },
];
