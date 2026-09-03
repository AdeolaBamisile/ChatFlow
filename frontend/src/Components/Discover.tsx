import { useState } from "react";
import {
  MessageCircle,
  Send,
  UserPlus,
  Users,
  Moon,
  Settings,
  Search,
} from "lucide-react";

type User = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  mutualFriends: number;
};

const users: User[] = [
  {
    id: 1,
    name: "David Jones",
    username: "@david.jones",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=DavidJones",
    bio: "Product designer who loves creating meaningful experiences.",
    mutualFriends: 14,
  },
  {
    id: 2,
    name: "Sarah Williams",
    username: "@sarah.will",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=SarahWilliams",
    bio: "Frontend developer & coffee enthusiast ☕",
    mutualFriends: 18,
  },
  {
    id: 3,
    name: "Alex Morgan",
    username: "@alex.morgan",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=AlexMorgan",
    bio: "Photographer capturing life one frame at a time 📸",
    mutualFriends: 32,
  },
  {
    id: 4,
    name: "Emily Carter",
    username: "@emily.carter",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=EmilyCarter",
    bio: "UX researcher passionate about human-centered design.",
    mutualFriends: 16,
  },
  {
    id: 5,
    name: "Michael Brown",
    username: "@michael.brown",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=MichaelBrown",
    bio: "Backend engineer building scalable applications.",
    mutualFriends: 27,
  },
  {
    id: 6,
    name: "Olivia Davis",
    username: "@olivia.davis",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=OliviaDavis",
    bio: "Digital artist & illustrator bringing ideas to life 🎨",
    mutualFriends: 14,
  },
  {
    id: 7,
    name: "Daniel Lee",
    username: "@daniel.lee",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=DanielLee",
    bio: "Tech enthusiast and open source contributor.",
    mutualFriends: 21,
  },
  {
    id: 8,
    name: "Sophia Martinez",
    username: "@sophia.martinez",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=SophiaMartinez",
    bio: "Marketing strategist helping brands tell their story.",
    mutualFriends: 12,
  },
  {
    id: 9,
    name: "James Wilson",
    username: "@james.wilson",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=JamesWilson",
    bio: "Fitness enthusiast and healthy lifestyle advocate.",
    mutualFriends: 19,
  },
  {
    id: 10,
    name: "Aisha Khan",
    username: "@aisha.khan",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=AishaKhan",
    bio: "Data analyst turning data into actionable insights.",
    mutualFriends: 22,
  },
  {
    id: 11,
    name: "Chris Taylor",
    username: "@chris.taylor",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=ChrisTaylor",
    bio: "Entrepreneur building digital products.",
    mutualFriends: 17,
  },
  {
    id: 12,
    name: "Isabella Rossi",
    username: "@isabella.rossi",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=IsabellaRossi",
    bio: "Travel lover exploring the world & cultures.",
    mutualFriends: 15,
  },
];

const categories = ["All", "Mutuals", "New Users"];

const Discover = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return (
      user.name.toLowerCase().includes(searchValue) ||
      user.username.toLowerCase().includes(searchValue) ||
      user.bio.toLowerCase().includes(searchValue)
    );
  });

  const handleAddFriend = (user: User) => {
    console.log(`Friend request sent to ${user.name}`);
  };

  return (
    <div className={darkMode ? "" : "light-mode"}>
      {/* =====================================================
          DISCOVER CONTENT
      ====================================================== */}

      <main className="discover-content">
        {/* =================================================
            HEADER
        ================================================== */}

        <header className="discover-header">
          <div className="discover-title">
            <h1>Find Friends</h1>

            <p>Find new people and connect</p>
          </div>

          {/* Search */}
          <div className="discover-search">
            <Search size={25} strokeWidth={1.8} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users by name, username or interests..."
            />
          </div>
        </header>

        {/* =================================================
            CATEGORY FILTERS
        ================================================== */}

        <div className="category-list">
          {categories.map((category) => (
            <button
              key={category}
              className={
                activeCategory === category
                  ? "category-button active"
                  : "category-button"
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* =================================================
            USER GRID
        ================================================== */}

        <section className="users-container">
          <div className="users-grid">
            {filteredUsers.map((user) => (
              <article className="user-card" key={user.id}>
                {/* User information at top */}
                <div className="user-main">
                  <img
                    className="user-avatar"
                    src={user.avatar}
                    alt={user.name}
                  />

                  <div className="user-identity">
                    <h2>{user.name}</h2>

                    <span>{user.username}</span>
                  </div>
                </div>

                {/* About */}
                <p className="user-bio">{user.bio}</p>

                {/* Divider */}
                <div className="card-divider" />

                {/* Bottom row */}
                <div className="user-card-bottom">
                  <span className="mutual-friends">
                    {user.mutualFriends} mutual friends
                  </span>

                  <button
                    className="add-friend-button"
                    onClick={() => handleAddFriend(user)}
                  >
                    Add Friend
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Discover;
