import { useState } from "react";
import { Search } from "lucide-react";
import FilterButton from "../Components/Discover&RequestsSpecific/FilterButton";
import type { RequestUser as User } from "../types";
import DiscoverIndex from "../Components/Discover&RequestsSpecific/UserCard/DiscoverIndex";

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
    mutualFriends: 0,
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
    mutualFriends: 0,
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
    mutualFriends: 0,
  },
];

const categories = ["All", "Mutuals", "New Users"];

const Discover = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((user) => {
    if (activeCategory === "All") return user;
    else if (activeCategory === "Mutuals") return user.mutualFriends > 0;
    else if (activeCategory === "New Users") return user.mutualFriends === 0;
    else return;
  });

  const searchedUsers = filteredUsers.filter((user) => {
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
    <div className="discover-page">
      <main className="discover-content">
        <header className="discover-header">
          <div className="discover-title">
            <h1>Discover</h1>

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
            <FilterButton
              key={category}
              category={category}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          ))}
        </div>

        {/* =================================================
      USER GRID
  ================================================== */}

        <section className="users-container">
          <div className="users-grid">
            {searchedUsers.map((user) => (
              <DiscoverIndex
                key={user.id}
                user={user}
                handleAddFriend={handleAddFriend}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Discover;
