/**
 * Quote Service
 * Provides a unique quote for each day of the year
 */

const QUOTES = [
    { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
    { text: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
    { text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
    { text: "It's not how much money you make, but how much money you keep.", author: "Robert Kiyosaki" },
    { text: "Beware of little expenses. A small leak will sink a great ship.", author: "Benjamin Franklin" },
    { text: "The stock market is designed to transfer money from the Active to the Patient.", author: "Warren Buffett" },
    { text: "Rich people believe 'I create my life'. Poor people believe 'Life happens to me'.", author: "T. Harv Eker" },
    { text: "Money is a terrible master but an excellent servant.", author: "P.T. Barnum" },
    { text: "You must gain control over your money or the lack of it will forever control you.", author: "Dave Ramsey" },
    { text: "Invest in yourself. Your career is the engine of your wealth.", author: "Paul Clitheroe" },
    { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
    { text: "Money often costs too much.", author: "Ralph Waldo Emerson" },
    { text: "Every time you borrow money, you're robbing your future self.", author: "Nathan W. Morris" },
    { text: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca" },
    { text: "Wealth is the ability to fully experience life.", author: "Henry David Thoreau" },
    { text: "The habit of saving is itself an education; it fosters every virtue.", author: "Thornton T. Munger" },
    { text: "Don't tell me where your priorities are. Show me where you spend your money and I'll tell you what they are.", author: "James W. Frick" },
    { text: "If you buy things you do not need, soon you will have to sell things you do need.", author: "Warren Buffett" },
    { text: "Never spend your money before you have it.", author: "Thomas Jefferson" },
    { text: "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.", author: "Ayn Rand" },
    { text: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.", author: "Dave Ramsey" },
    { text: "A penny saved is a penny earned.", author: "Benjamin Franklin" },
    { text: "He who loses money, loses much; He who loses a friend, loses much more; He who loses faith, loses all.", author: "Eleanor Roosevelt" },
    { text: "Happiness is not in the mere possession of money; it lies in the joy of achievement.", author: "Franklin D. Roosevelt" },
    { text: "Empty pockets never held anyone back. Only empty heads and empty hearts can do that.", author: "Norman Vincent Peale" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "Opportunity is missed by most people because it is dressed in overalls and looks like work.", author: "Thomas Edison" },
    { text: "Formal education will make you a living; self-education will make you a fortune.", author: "Jim Rohn" },
    { text: "Time is more valuable than money. You can get more money, but you cannot get more time.", author: "Jim Rohn" },
    { text: "Don't work for money; make it work for you.", author: "Robert Kiyosaki" },
    { text: "The art is not in making money, but in keeping it.", author: "Proverb" },
    { text: "Real wealth is not about money. It's about freedom.", author: "James Clear" },
    { text: "Compound interest is the eighth wonder of the world. He who understands it, earns it ... he who doesn't ... pays it.", author: "Albert Einstein" },
    { text: "The safe way to double your money is to fold it over once and put it in your pocket.", author: "Kin Hubbard" },
    { text: "Money never made a man happy yet, nor will it. The more a man has, the more he wants.", author: "Benjamin Franklin" },
    { text: "Investing should be more like watching paint dry or watching grass grow. If you want excitement, take $800 and go to Las Vegas.", author: "Paul Samuelson" },
    { text: "How many millionaires do you know who have become wealthy by investing in savings accounts? I rest my case.", author: "Robert G. Allen" },
    { text: "I made my money by selling too soon.", author: "Bernard Baruch" },
    { text: "The four most dangerous words in investing are: 'This time it's different'.", author: "Sir John Templeton" },
    { text: "Wide diversification is only required when investors do not understand what they are doing.", author: "Warren Buffett" },
    { text: "Know what you own, and know why you own it.", author: "Peter Lynch" },
    { text: "In investing, what is comfortable is rarely profitable.", author: "Robert Arnott" },
    { text: "Spend each day trying to be a little wiser than you were when you woke up.", author: "Charlie Munger" },
    { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett" },
    { text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett" },
    { text: "The most important quality for an investor is temperament, not intellect.", author: "Warren Buffett" },
    { text: "You don't need to be a rocket scientist. Investing is not a game where the guy with the 160 IQ beats the guy with 130 IQ.", author: "Warren Buffett" },
    { text: "We simply attempt to be fearful when others are greedy and to be greedy only when others are fearful.", author: "Warren Buffett" },
    { text: "Someone's sitting in the shade today because someone planted a tree a long time ago.", author: "Warren Buffett" },
    { text: "If you aren't willing to own a stock for ten years, don't even think about owning it for ten minutes.", author: "Warren Buffett" }
];

class QuoteService {
    /**
     * Get the quote for today
     * Uses the day of the year to select a deterministic quote
     */
    getDailyQuote() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Use modulo to cycle through quotes if we have fewer quotes than days in a year
        const quoteIndex = dayOfYear % QUOTES.length;

        return QUOTES[quoteIndex];
    }

    /**
     * Get a random quote (for testing or variety)
     */
    getRandomQuote() {
        return QUOTES[Math.floor(Math.random() * QUOTES.length)];
    }
}

export const quoteService = new QuoteService();
export default quoteService;
