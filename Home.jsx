import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThumbsUp, ThumbsDown, Star, Sparkles } from "lucide-react";

// A simple React component demonstrating a product catalog with
// community stories. Minor improvements have been made over the
// original snippet such as memoization of expensive calculations
// and stable callbacks for event handlers.
export default function Home() {
  const [visibleCount, setVisibleCount] = useState(3);
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState({ email: "" });
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState("buy");
  const [submission, setSubmission] = useState({
    productId: "",
    content: "",
    type: "anecdote",
  });

  // simplified product seed data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Handmade Leather Journal",
      creator: "Fox & Stitch",
      creatorPhoto: "/creators/fox-stitch.jpg",
      image: "/leather-journal.jpg",
      userStories: [
        {
          type: "anecdote",
          content:
            "I spilled coffee on this and now the leather smells like espresso. I love it more than ever.",
          upvotes: 12,
          downvotes: 1,
        },
        {
          type: "sixWords",
          content: "Memories inked. Leather worn. Story grows.",
          upvotes: 21,
          downvotes: 0,
        },
      ],
    },
    {
      id: 2,
      name: "Glazed Stoneware Mug",
      creator: "Kiln Ritual",
      creatorPhoto: "/creators/kiln-ritual.jpg",
      image: "/stoneware-mug.jpg",
      userStories: [
        {
          type: "video",
          content: "https://example.com/mug-on-mountaintop.mp4",
          upvotes: 18,
          downvotes: 2,
        },
      ],
    },
    {
      id: 3,
      name: "Handwoven Wool Throw",
      creator: "Loom & Field",
      creatorPhoto: "/creators/loom-field.jpg",
      image: "/wool-throw.jpg",
      userStories: [],
    },
    {
      id: 4,
      name: "Forged Iron Skillet",
      creator: "Ironhide Works",
      creatorPhoto: "/creators/ironhide-works.jpg",
      image: "/iron-skillet.jpg",
      userStories: [],
    },
  ]);

  // compute a top story for a product; memoized for performance
  const getTopStory = useCallback((stories) => {
    if (!stories.length) return null;
    return stories.reduce((top, current) => {
      const topScore = top.upvotes - top.downvotes;
      const currentScore = current.upvotes - current.downvotes;
      return currentScore > topScore ? current : top;
    }, stories[0]);
  }, []);

  // handle login form
  const handleLogin = useCallback(() => {
    if (login.email) {
      const newUser = { name: login.email.split("@")[0] };
      setUser(newUser);
      setShowLogin(false);
      localStorage.setItem("user", JSON.stringify(newUser));
    }
  }, [login.email]);

  // restore user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // submit a new story
  const handleSubmit = useCallback(() => {
    if (!submission.productId || !submission.content) return;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === parseInt(submission.productId)
          ? {
              ...p,
              userStories: [
                ...(p.userStories || []),
                {
                  content: submission.content,
                  type: submission.type,
                  upvotes: 0,
                  downvotes: 0,
                },
              ],
            }
          : p
      )
    );
    setSubmission({ productId: "", content: "", type: "anecdote" });
  }, [submission]);

  // vote on a story
  const handleVote = useCallback((productId, storyIndex, isUpvote) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const updatedStories = [...p.userStories];
        const story = { ...updatedStories[storyIndex] };
        if (isUpvote) story.upvotes += 1;
        else story.downvotes += 1;
        updatedStories[storyIndex] = story;
        return { ...p, userStories: updatedStories };
      })
    );
  }, []);

  // memoized product card to avoid recalculations
  const ProductCard = ({ product }) => {
    const topStory = useMemo(
      () => getTopStory(product.userStories),
      [getTopStory, product.userStories]
    );

    return (
      <Card className="rounded-3xl shadow-2xl overflow-hidden relative">
        <img src={product.image} alt={product.name} className="object-cover w-full h-64" />
        <Button className="absolute top-4 right-4 z-10 rounded-full shadow-lg" variant="secondary">
          Add to Cart
        </Button>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-bold font-serif flex items-center gap-2">
            {product.name}
            {topStory && topStory.upvotes - topStory.downvotes >= 10 && (
              <Star className="w-5 h-5 text-yellow-500" />
            )}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <img src={product.creatorPhoto} alt={product.creator} className="w-7 h-7 rounded-full" />
            <span>by {product.creator}</span>
          </div>
          <p className="text-sm italic text-zinc-600">
            {topStory ? topStory.content : "Be the first to tell its story."}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-8 space-y-12 bg-gradient-to-b from-white to-zinc-50 min-h-screen">
      <header className="text-center">
        <h1 className="text-6xl font-serif font-bold tracking-tight flex justify-center items-center gap-2">
          <Sparkles className="text-pink-400 w-8 h-8 animate-pulse" /> BESPOKE
        </h1>
        <p className="text-lg mt-3 text-muted-foreground">Goods worth talking about</p>
        <div className="flex justify-center mt-6">
          <div className="w-full max-w-3xl">
            <TabsList className="flex justify-center space-x-4 bg-white border rounded-full p-1 shadow">
              <TabsTrigger value="buy" onClick={() => setActiveTab("buy")}>Buy</TabsTrigger>
              <TabsTrigger value="sell" onClick={() => setActiveTab("sell")}>Sell</TabsTrigger>
              <TabsTrigger
                value="tell"
                onClick={() => {
                  setActiveTab("tell");
                  setShowLogin(true);
                }}
              >
                Tell
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </header>

      {activeTab === "tell" && !user && showLogin && (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 space-y-4">
          <h2 className="text-xl font-bold text-center">Create Account</h2>
          <Input
            placeholder="Email"
            value={login.email}
            onChange={(e) => setLogin({ ...login, email: e.target.value })}
          />
          <Button className="w-full" onClick={handleLogin}>
            Get Started
          </Button>
        </div>
      )}

      {(activeTab === "buy" || activeTab === "sell") && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {products.slice(0, visibleCount).map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      )}

      {activeTab === "tell" && user && (
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-center">Tell Your Story</h2>
          <select
            className="w-full p-3 border border-zinc-300 rounded-xl"
            value={submission.productId}
            onChange={(e) => setSubmission({ ...submission, productId: e.target.value })}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <select
            className="w-full p-3 border border-zinc-300 rounded-xl"
            value={submission.type}
            onChange={(e) => setSubmission({ ...submission, type: e.target.value })}
          >
            <option value="anecdote">Anecdote</option>
            <option value="sixWords">Six-word Story</option>
            <option value="video">Video Link</option>
          </select>
          <Textarea
            placeholder="Share your story or link..."
            value={submission.content}
            onChange={(e) => setSubmission({ ...submission, content: e.target.value })}
            className="min-h-[100px] border-zinc-300 rounded-xl"
          />
          <Button onClick={handleSubmit} size="lg" className="w-full">
            Submit Story
          </Button>
        </div>
      )}

      {activeTab === "tell" && user && (
        <div className="mt-12 max-w-5xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Live Community Stories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.flatMap((product) =>
              product.userStories.map((story, index) => (
                <div key={`${product.id}-${index}`} className="p-4 border rounded-xl bg-white shadow-sm space-y-2">
                  <h4 className="font-bold text-zinc-800">{product.name}</h4>
                  {story.type === "video" ? (
                    <video controls src={story.content} className="w-full rounded-lg" />
                  ) : (
                    <p className="text-sm text-zinc-700">{story.content}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs">
                    <Button variant="ghost" size="sm" onClick={() => handleVote(product.id, index, true)}>
                      <ThumbsUp className="w-4 h-4" /> {story.upvotes}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleVote(product.id, index, false)}>
                      <ThumbsDown className="w-4 h-4" /> {story.downvotes}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {visibleCount < products.length && activeTab !== "tell" && (
        <div className="flex justify-center mt-8">
          <Button onClick={() => setVisibleCount(visibleCount + 3)} size="lg">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
