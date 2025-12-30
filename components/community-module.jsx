"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  MessageSquare,
  Calendar,
  Trophy,
  Heart,
  Share2,
  Search,
  Plus,
  Send,
  MessageCircle,
  Eye,
  UserPlus,
  Bookmark,
  Globe,
  ImageIcon,
  MoreHorizontal,
  Crown,
  Flame,
  TrendingUp,
  Star,
  Code,
  Briefcase,
  GraduationCap,
  Award,
  Clock,
  Flag,
  Share,
  Copy,
  Verified,
  Sparkles,
  Activity,
  BarChart3,
  CalendarIcon,
  MapPinIcon,
  VideoIcon,
  Pin,
  Hash,
  Mic,
  Info,
  Loader2,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { apiService } from "../lib/api"
import { LoadingSpinner } from "./ui/loading"

export default function CommunityModule() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("feed")
  const [newPostContent, setNewPostContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [selectedPostType, setSelectedPostType] = useState("text")
  const [notifications, setNotifications] = useState(3)
  const [liveUsers, setLiveUsers] = useState(1247)
  const fileInputRef = useRef(null)

  // Real data states
  const [communityPosts, setCommunityPosts] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [topMembers, setTopMembers] = useState([])
  const [trendingTopics, setTrendingTopics] = useState([])
  const [communityStats, setCommunityStats] = useState({})
  const [discussionCategories, setDiscussionCategories] = useState([])
  const [liveActivities, setLiveActivities] = useState([])

  useEffect(() => {
    fetchCommunityData()
  }, [])

  const fetchCommunityData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all community-related data
      const [feedResponse, eventsResponse, membersResponse, trendingResponse] = await Promise.all([
        apiService.getCommunityFeed({ limit: 10, sort: sortBy }),
        apiService.getCommunityEvents({ limit: 10, upcoming: true }),
        apiService.getCommunityMembers({ limit: 10, sort: "reputation" }),
        apiService.getTrendingTopics(),
      ])

      if (feedResponse.success) {
        setCommunityPosts(feedResponse.data.posts || [])
      }

      if (eventsResponse.success) {
        setUpcomingEvents(eventsResponse.data.events || [])
      }

      if (membersResponse.success) {
        setTopMembers(membersResponse.data.members || [])
      }

      if (trendingResponse.success) {
        setTrendingTopics(trendingResponse.data.topics || [])
      }

      // Set community stats
      setCommunityStats({
        totalMembers: 15847,
        activeToday: 1247,
        totalPosts: 8934,
        totalEvents: 156,
        totalProjects: 423,
        mentorshipSessions: 89,
        jobPostings: 67,
        successStories: 234,
      })
    } catch (err) {
      console.error("Error fetching community data:", err)
      setError(err.message)

      // Fallback to demo data if API fails
      setCommunityStats({
        totalMembers: 15847,
        activeToday: 1247,
        totalPosts: 8934,
        totalEvents: 156,
        totalProjects: 423,
        mentorshipSessions: 89,
        jobPostings: 67,
        successStories: 234,
      })

      setTrendingTopics([
        { name: "React 19", posts: 234, growth: "+15%" },
        { name: "AI Development", posts: 189, growth: "+28%" },
        { name: "Remote Work", posts: 156, growth: "+8%" },
        { name: "Web3", posts: 143, growth: "+22%" },
        { name: "TypeScript", posts: 128, growth: "+12%" },
        { name: "DevOps", posts: 98, growth: "+18%" },
      ])

      setCommunityPosts([
        {
          _id: 1,
          type: "achievement",
          author: {
            firstName: "Sarah",
            lastName: "Chen",
            username: "sarahdev",
            avatar: "/placeholder.svg?height=50&width=50&text=SC",
            title: "Senior Full Stack Developer",
            company: "Google",
            level: "Expert",
            badge: "Top Contributor",
            verified: true,
            followers: 2847,
            following: 456,
            joinDate: "2022-01-15",
            location: "San Francisco, CA",
            skills: ["React", "Node.js", "TypeScript", "AWS"],
            reputation: 4.9,
            totalPosts: 234,
            totalLikes: 5678,
          },
          content:
            "🎉 Just shipped a major feature that reduces our app's bundle size by 40%! Used React 18's new concurrent features and implemented smart code splitting. The performance improvements are incredible - users are loving the faster load times!",
          media: [
            {
              type: "image",
              url: "/placeholder.svg?height=400&width=600&text=Performance+Dashboard",
              caption: "Before vs After Performance Metrics",
            },
          ],
          codeSnippet: {
            language: "javascript",
            code: `// Smart code splitting with React.lazy
const LazyComponent = React.lazy(() => 
  import('./HeavyComponent').then(module => ({
    default: module.HeavyComponent
  }))
);`,
          },
          likes: 156,
          comments: 23,
          shares: 12,
          bookmarks: 45,
          views: 1234,
          createdAt: "2 hours ago",
          tags: ["React", "Performance", "Web Development", "JavaScript"],
          hasLiked: false,
          hasBookmarked: true,
          hasShared: false,
          isPinned: false,
          isSponsored: false,
          category: "Technical",
          readTime: "3 min read",
        },
      ])

      setUpcomingEvents([
        {
          _id: 1,
          title: "React 19 Deep Dive Workshop",
          description:
            "Comprehensive workshop covering React 19's new features, concurrent rendering, and performance optimizations.",
          date: "2024-03-15",
          time: "2:00 PM EST",
          duration: "3 hours",
          type: "Workshop",
          level: "Intermediate",
          attendees: 234,
          maxAttendees: 300,
          waitlist: 45,
          host: {
            firstName: "Sarah",
            lastName: "Chen",
            avatar: "/placeholder.svg?height=40&width=40&text=SC",
            title: "Senior Developer at Google",
            verified: true,
          },
          speakers: [
            {
              firstName: "Sarah",
              lastName: "Chen",
              title: "Senior Developer at Google",
              avatar: "/placeholder.svg?height=40&width=40&text=SC",
            },
          ],
          tags: ["React", "Frontend", "Advanced", "Hands-on"],
          isOnline: true,
          platform: "Zoom",
          price: "Free",
          hasRecording: true,
          rating: 4.8,
          reviews: 156,
          category: "Technical",
          difficulty: "Intermediate",
          certificate: true,
        },
      ])

      setTopMembers([
        {
          _id: 1,
          firstName: "Sarah",
          lastName: "Chen",
          username: "sarahdev",
          avatar: "/placeholder.svg?height=60&width=60&text=SC",
          title: "Senior Full Stack Developer",
          company: "Google",
          level: "Expert",
          badge: "Top Contributor",
          verified: true,
          points: 15420,
          contributions: 234,
          followers: 2847,
          following: 456,
          joinDate: "2022-01-15",
          location: "San Francisco, CA",
          skills: ["React", "Node.js", "TypeScript", "AWS", "GraphQL"],
          bio: "Passionate about building scalable web applications and mentoring junior developers.",
          reputation: 4.9,
          responseTime: "< 2 hours",
          languages: ["English", "Mandarin"],
          timezone: "PST",
          availability: "Available for mentoring",
        },
      ])

      setLiveActivities([
        {
          _id: 1,
          type: "new_member",
          user: "Emma Wilson",
          action: "joined the community",
          timestamp: "2 minutes ago",
          avatar: "/placeholder.svg?height=32&width=32&text=EW",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleLikePost = async (postId) => {
    try {
      // Update local state optimistically
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                hasLiked: !post.hasLiked,
                likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
              }
            : post,
        ),
      )

      // Make API call (implement like endpoint)
      // await apiService.likePost(postId)
    } catch (err) {
      console.error("Error liking post:", err)
    }
  }

  const handleBookmarkPost = async (postId) => {
    try {
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                hasBookmarked: !post.hasBookmarked,
                bookmarks: post.hasBookmarked ? post.bookmarks - 1 : post.bookmarks + 1,
              }
            : post,
        ),
      )

      // await apiService.bookmarkPost(postId)
    } catch (err) {
      console.error("Error bookmarking post:", err)
    }
  }

  const handleSharePost = async (postId) => {
    try {
      setCommunityPosts((prev) =>
        prev.map((post) => (post._id === postId ? { ...post, shares: post.shares + 1 } : post)),
      )

      // await apiService.sharePost(postId)
    } catch (err) {
      console.error("Error sharing post:", err)
    }
  }

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await apiService.registerForEvent(eventId)
      if (response.success) {
        setUpcomingEvents((prev) =>
          prev.map((event) =>
            event._id === eventId ? { ...event, attendees: event.attendees + 1, isRegistered: true } : event,
          ),
        )
      }
    } catch (err) {
      console.error("Error joining event:", err)
    }
  }

  const handleFollowMember = async (memberId) => {
    try {
      setTopMembers((prev) =>
        prev.map((member) => (member._id === memberId ? { ...member, isFollowing: !member.isFollowing } : member)),
      )

      // await apiService.followMember(memberId)
    } catch (err) {
      console.error("Error following member:", err)
    }
  }

  const handleCreatePost = async () => {
    if (newPostContent.trim()) {
      setIsLoading(true)
      try {
        const response = await apiService.createPost({
          content: newPostContent.trim(),
          type: selectedPostType,
        })

        if (response.success) {
          // Add new post to the beginning of the feed
          setCommunityPosts((prev) => [response.data.post, ...prev])
          setNewPostContent("")
          setShowCreatePost(false)
        }
      } catch (err) {
        console.error("Error creating post:", err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const PostCard = ({ post }) => (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-[#1E2E26] dark:via-[#1E2E26] dark:to-[#121212]/50">
      {/* Sponsored/Pinned Indicators */}
      {post.isSponsored && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F97A00] to-[#FED16A]" />
      )}
      {post.isPinned && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-[#386641]/10 dark:bg-[#FF9433]/10 text-[#386641] dark:text-[#FF9433] border-0">
            <Pin className="h-3 w-3 mr-1" />
            Pinned
          </Badge>
        </div>
      )}

      <CardContent className="p-6 space-y-6">
        {/* Post Header */}
        <div className="flex items-start space-x-4">
          <div className="relative">
            <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-[#1E2E26] shadow-lg">
              <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.firstName} />
              <AvatarFallback className="bg-gradient-to-br from-[#386641] to-[#F97A00] dark:from-[#FF9433] dark:to-[#FFD86B] text-white dark:text-[#121212] font-bold">
                {post.author.firstName?.[0]}
                {post.author.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {post.author.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                <Verified className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-gray-900 dark:text-[#FFD86B] truncate hover:text-[#386641] dark:hover:text-[#FF9433] cursor-pointer transition-colors">
                {post.author.firstName} {post.author.lastName}
              </h3>
              <span className="text-gray-500 dark:text-[#FFD86B]/60 text-sm">@{post.author.username}</span>
              <Badge
                className={`${
                  post.author.badge === "Top Contributor"
                    ? "bg-gradient-to-r from-[#386641] to-[#2d5233] dark:from-[#FF9433] dark:to-[#e6841d] text-white"
                    : post.author.badge === "Design Guru"
                      ? "bg-gradient-to-r from-[#F97A00] to-[#e06900] dark:from-[#FF9433] dark:to-[#e6841d] text-white"
                      : "bg-gradient-to-r from-[#FED16A] to-[#f5c842] text-[#b8860b] dark:text-[#121212]"
                } border-0 text-xs font-medium shadow-sm`}
              >
                {post.author.badge}
              </Badge>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-[#FFD86B]/70">
              <span>{post.author.title}</span>
              {post.author.company && (
                <>
                  <span>•</span>
                  <span className="font-medium">{post.author.company}</span>
                </>
              )}
              <span>•</span>
              <span>{post.createdAt}</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{post.views}</span>
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Bookmark className="h-4 w-4 mr-2" />
                Save Post
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Content */}
        <div className="space-y-4">
          <p className="text-gray-800 dark:text-[#FFD86B]/90 leading-relaxed text-base">{post.content}</p>

          {/* Code Snippet */}
          {post.codeSnippet && (
            <div className="bg-gray-900 dark:bg-black rounded-xl p-4 overflow-x-auto">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-gray-700 text-gray-300 border-0 text-xs">{post.codeSnippet.language}</Badge>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="text-sm text-gray-300 font-mono">
                <code>{post.codeSnippet.code}</code>
              </pre>
            </div>
          )}

          {/* Media Content */}
          {post.media && post.media.length > 0 && (
            <div className="space-y-3">
              {post.media.map((media, index) => (
                <div key={index} className="rounded-xl overflow-hidden shadow-lg">
                  {media.type === "image" && (
                    <div className="relative group">
                      <img
                        src={media.url || "/placeholder.svg"}
                        alt={media.caption || "Post image"}
                        className="w-full h-auto max-h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {media.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <p className="text-white text-sm">{media.caption}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags?.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="border-[#386641]/30 dark:border-[#FF9433]/30 text-[#386641] dark:text-[#FF9433] hover:bg-[#386641]/10 dark:hover:bg-[#FF9433]/10 cursor-pointer transition-colors"
            >
              <Hash className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#FFD86B]/20">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikePost(post._id)}
              className={`flex items-center space-x-2 transition-all duration-300 ${
                post.hasLiked
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-500 hover:text-red-500 dark:text-[#FFD86B]/60 dark:hover:text-red-400"
              }`}
            >
              <Heart className={`h-5 w-5 ${post.hasLiked ? "fill-current" : ""}`} />
              <span className="font-medium">{post.likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-500 hover:text-[#386641] dark:text-[#FFD86B]/60 dark:hover:text-[#FF9433] transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">{post.comments}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSharePost(post._id)}
              className="flex items-center space-x-2 text-gray-500 hover:text-[#F97A00] dark:text-[#FFD86B]/60 dark:hover:text-[#FF9433] transition-colors"
            >
              <Share2 className="h-5 w-5" />
              <span className="font-medium">{post.shares}</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBookmarkPost(post._id)}
              className={`transition-colors ${
                post.hasBookmarked
                  ? "text-[#F97A00] dark:text-[#FF9433]"
                  : "text-gray-500 hover:text-[#F97A00] dark:text-[#FFD86B]/60 dark:hover:text-[#FF9433]"
              }`}
            >
              <Bookmark className={`h-5 w-5 ${post.hasBookmarked ? "fill-current" : ""}`} />
            </Button>
            <span className="text-sm text-gray-500 dark:text-[#FFD86B]/60">{post.readTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const EventCard = ({ event }) => (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-[#1E2E26] dark:via-[#1E2E26] dark:to-[#121212]/50">
      <div className="relative">
        {/* Event Type Banner */}
        <div
          className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${
            event.type === "Workshop"
              ? "from-[#386641] to-[#2d5233]"
              : event.type === "Networking"
                ? "from-[#F97A00] to-[#e06900]"
                : "from-[#FED16A] to-[#f5c842]"
          }`}
        />

        <CardContent className="p-6 space-y-6">
          {/* Event Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge
                  className={`${
                    event.type === "Workshop"
                      ? "bg-[#386641]/10 dark:bg-[#FF9433]/10 text-[#386641] dark:text-[#FF9433]"
                      : event.type === "Networking"
                        ? "bg-[#F97A00]/10 dark:bg-[#FF9433]/10 text-[#F97A00] dark:text-[#FF9433]"
                        : "bg-[#FED16A]/20 dark:bg-[#FFD86B]/20 text-[#b8860b] dark:text-[#FFD86B]"
                  } border-0 font-medium`}
                >
                  {event.type}
                </Badge>
                <Badge
                  className={`${
                    event.level === "Beginner"
                      ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                      : event.level === "Intermediate"
                        ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                        : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                  } border-0 text-xs`}
                >
                  {event.level}
                </Badge>
                {event.certificate && (
                  <Badge className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 border-0 text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    Certificate
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-[#FFD86B] group-hover:text-[#386641] dark:group-hover:text-[#FF9433] transition-colors">
                {event.title}
              </h3>
            </div>

            <div className="text-right">
              <Badge
                className={`${
                  event.price === "Free"
                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                    : "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400"
                } border-0 font-bold`}
              >
                {event.price}
              </Badge>
              {event.rating && (
                <div className="flex items-center space-x-1 mt-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{event.rating}</span>
                  <span className="text-xs text-gray-500">({event.reviews})</span>
                </div>
              )}
            </div>
          </div>

          {/* Event Description */}
          <p className="text-gray-700 dark:text-[#FFD86B]/80 leading-relaxed">{event.description}</p>

          {/* Event Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-[#386641] dark:text-[#FF9433]" />
                <span className="font-medium">{event.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-[#F97A00] dark:text-[#FF9433]" />
                <span>
                  {event.time} ({event.duration})
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {event.isOnline ? (
                  <>
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span>Online - {event.platform}</span>
                  </>
                ) : (
                  <>
                    <MapPinIcon className="h-4 w-4 text-red-500" />
                    <span>{event.location}</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-[#386641] dark:text-[#FF9433]" />
                <span>
                  {event.attendees}/{event.maxAttendees} attending
                </span>
              </div>
              {event.waitlist > 0 && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>{event.waitlist} on waitlist</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-[#FED16A] dark:text-[#FFD86B]" />
                <span>{event.difficulty}</span>
              </div>
            </div>
          </div>

          {/* Speakers */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-[#FFD86B] flex items-center">
              <Mic className="h-4 w-4 mr-2" />
              Speakers
            </h4>
            <div className="flex items-center space-x-3">
              {event.speakers?.map((speaker, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={speaker.avatar || "/placeholder.svg"} alt={speaker.firstName} />
                    <AvatarFallback className="bg-[#386641] dark:bg-[#FF9433] text-white text-xs">
                      {speaker.firstName?.[0]}
                      {speaker.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-[#FFD86B]">
                      {speaker.firstName} {speaker.lastName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-[#FFD86B]/70">{speaker.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {event.tags?.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-[#386641]/30 dark:border-[#FF9433]/30 text-[#386641] dark:text-[#FF9433] text-xs"
              >
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Attendance Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-[#FFD86B]/70">Attendance</span>
              <span className="font-medium text-gray-900 dark:text-[#FFD86B]">
                {Math.round((event.attendees / event.maxAttendees) * 100)}% Full
              </span>
            </div>
            <Progress value={(event.attendees / event.maxAttendees) * 100} className="h-2" />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={() => handleJoinEvent(event._id)}
              className="flex-1 bg-gradient-to-r from-[#386641] to-[#2d5233] dark:from-[#FF9433] dark:to-[#e6841d] hover:from-[#2d5233] hover:to-[#1f3d26] dark:hover:from-[#e6841d] dark:hover:to-[#cc7016] text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              {event.attendees >= event.maxAttendees
                ? "Join Waitlist"
                : event.isRegistered
                  ? "Registered"
                  : "Join Event"}
            </Button>
            <Button
              variant="outline"
              className="border-[#F97A00] dark:border-[#FF9433] text-[#F97A00] dark:text-[#FF9433] hover:bg-[#F97A00] dark:hover:bg-[#FF9433] hover:text-white dark:hover:text-[#121212] bg-transparent"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 dark:border-[#FFD86B]/30 text-gray-600 dark:text-[#FFD86B]/70 hover:bg-gray-50 dark:hover:bg-[#1E2E26]/50 bg-transparent"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )

  const MemberCard = ({ member, rank }) => (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-[#1E2E26] dark:via-[#1E2E26] dark:to-[#121212]/50">
      {/* Rank Badge */}
      {rank <= 3 && (
        <div className="absolute top-4 right-4 z-10">
          <Badge
            className={`${
              rank === 1
                ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900"
                : rank === 2
                  ? "bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900"
                  : "bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900"
            } border-0 font-bold shadow-lg`}
          >
            <Crown className="h-3 w-3 mr-1" />#{rank}
          </Badge>
        </div>
      )}

      <CardContent className="p-6 space-y-6">
        {/* Member Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-[#1E2E26] shadow-xl">
              <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.firstName} />
              <AvatarFallback className="bg-gradient-to-br from-[#386641] to-[#F97A00] dark:from-[#FF9433] dark:to-[#FFD86B] text-white dark:text-[#121212] text-xl font-bold">
                {member.firstName?.[0]}
                {member.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {member.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 shadow-lg">
                <Verified className="h-4 w-4 text-white" />
              </div>
            )}
            {/* Online Status */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-[#1E2E26] shadow-lg animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-[#FFD86B] group-hover:text-[#386641] dark:group-hover:text-[#FF9433] transition-colors">
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-gray-600 dark:text-[#FFD86B]/70">@{member.username}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-[#FFD86B]/80">{member.title}</p>
            {member.company && (
              <p className="text-sm text-[#386641] dark:text-[#FF9433] font-medium">{member.company}</p>
            )}
            <Badge
              className={`${
                member.badge === "Top Contributor"
                  ? "bg-gradient-to-r from-[#386641] to-[#2d5233] text-white"
                  : member.badge === "Design Guru"
                    ? "bg-gradient-to-r from-[#F97A00] to-[#e06900] text-white"
                    : "bg-gradient-to-r from-[#FED16A] to-[#f5c842] text-[#b8860b]"
              } border-0 font-medium shadow-sm`}
            >
              {member.badge}
            </Badge>
          </div>
        </div>

        {/* Member Bio */}
        <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 text-center leading-relaxed">{member.bio}</p>

        {/* Skills */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-[#FFD86B] flex items-center">
            <Code className="h-4 w-4 mr-2" />
            Skills
          </h4>
          <div className="flex flex-wrap gap-1">
            {member.skills?.slice(0, 5).map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-[#386641]/30 dark:border-[#FF9433]/30 text-[#386641] dark:text-[#FF9433] text-xs"
              >
                {skill}
              </Badge>
            ))}
            {member.skills?.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{member.skills.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-[#386641] dark:text-[#FF9433]">{member.points?.toLocaleString()}</p>
            <p className="text-xs text-gray-600 dark:text-[#FFD86B]/70">Points</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-[#F97A00] dark:text-[#FF9433]">{member.contributions}</p>
            <p className="text-xs text-gray-600 dark:text-[#FFD86B]/70">Posts</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-[#b8860b] dark:text-[#FFD86B]">
              {member.followers?.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-[#FFD86B]/70">Followers</p>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{member.reputation}</p>
            </div>
            <p className="text-xs text-gray-600 dark:text-[#FFD86B]/70">Rating</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-[#FFD86B]/70">Response Time:</span>
            <span className="font-medium text-green-600 dark:text-green-400">{member.responseTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-[#FFD86B]/70">Location:</span>
            <span className="font-medium">{member.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-[#FFD86B]/70">Joined:</span>
            <span className="font-medium">{new Date(member.joinDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Availability Status */}
        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">{member.availability}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={() => handleFollowMember(member._id)}
            className="flex-1 bg-gradient-to-r from-[#386641] to-[#2d5233] dark:from-[#FF9433] dark:to-[#e6841d] hover:from-[#2d5233] hover:to-[#1f3d26] text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {member.isFollowing ? "Following" : "Follow"}
          </Button>
          <Button
            variant="outline"
            className="border-[#F97A00] dark:border-[#FF9433] text-[#F97A00] dark:text-[#FF9433] hover:bg-[#F97A00] dark:hover:bg-[#FF9433] hover:text-white dark:hover:text-[#121212] transition-all duration-300 bg-transparent"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 dark:border-[#FFD86B]/30 text-gray-600 dark:text-[#FFD86B]/70 hover:bg-gray-50 dark:hover:bg-[#1E2E26]/50 bg-transparent"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF4A4]/10 via-white to-[#FED16A]/5 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#1E2E26]/20 flex items-center justify-center">
        <LoadingSpinner size="xl" className="text-[#386641] dark:text-[#FF9433]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF4A4]/10 via-white to-[#FED16A]/5 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#1E2E26]/20 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section */}
        <div className="relative mb-16 text-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-[#386641]/5 dark:bg-[#FF9433]/5 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute top-20 right-20 w-24 h-24 bg-[#F97A00]/5 dark:bg-[#FF9433]/5 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="absolute bottom-10 left-1/3 w-20 h-20 bg-[#FED16A]/10 dark:bg-[#FFD86B]/10 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "2s" }}
            />
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#386641]/10 to-[#F97A00]/10 dark:from-[#FF9433]/10 dark:to-[#FFD86B]/10 px-6 py-3 rounded-full">
              <Sparkles className="h-5 w-5 text-[#F97A00] dark:text-[#FF9433] animate-spin" />
              <span className="text-sm font-medium text-[#386641] dark:text-[#FF9433]">
                {liveUsers.toLocaleString()} members online now
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-[#386641] via-[#F97A00] to-[#FED16A] dark:from-[#FF9433] dark:via-[#FFD86B] dark:to-[#FF9433] bg-clip-text text-transparent mb-6 leading-tight">
              FusionBridge Community
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 dark:text-[#FFD86B]/80 max-w-4xl mx-auto leading-relaxed">
              Where developers, designers, and innovators connect, collaborate, and create the future together
            </p>

            {/* Live Activity Ticker */}
            <div className="bg-white/80 dark:bg-[#1E2E26]/80 backdrop-blur-sm rounded-2xl p-4 max-w-2xl mx-auto shadow-lg">
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className="flex items-center space-x-2 text-green-500">
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-medium">Live Activity</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="animate-marquee whitespace-nowrap">
                    {liveActivities.map((activity, index) => (
                      <span key={activity._id} className="text-sm text-gray-600 dark:text-[#FFD86B]/70 mx-4">
                        <strong>{activity.user}</strong> {activity.action} • {activity.timestamp}
                        {index < liveActivities.length - 1 && " | "}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
          {Object.entries(communityStats).map(([key, value], index) => {
            const icons = [Users, Activity, MessageSquare, Calendar, Code, GraduationCap, Briefcase, Trophy]
            const colors = [
              "from-[#386641] to-[#2d5233]",
              "from-[#F97A00] to-[#e06900]",
              "from-[#FED16A] to-[#f5c842]",
              "from-blue-500 to-blue-600",
              "from-purple-500 to-purple-600",
              "from-green-500 to-green-600",
              "from-red-500 to-red-600",
              "from-indigo-500 to-indigo-600",
            ]
            const Icon = icons[index]

            return (
              <Card
                key={key}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50/50 dark:from-[#1E2E26] dark:to-[#121212]/50"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${colors[index]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />
                <CardContent className="p-4 text-center space-y-3 relative z-10">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${colors[index]} rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-gray-900 dark:text-[#FFD86B] group-hover:scale-105 transition-transform duration-300">
                      {typeof value === "number" ? value.toLocaleString() : value}
                    </p>
                    <p className="text-xs font-medium text-gray-600 dark:text-[#FFD86B]/70 uppercase tracking-wider">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Enhanced Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <TabsList className="grid grid-cols-4 lg:w-auto bg-white/80 dark:bg-[#1E2E26]/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-2">
              <TabsTrigger
                value="feed"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#386641] data-[state=active]:to-[#2d5233] dark:data-[state=active]:from-[#FF9433] dark:data-[state=active]:to-[#e6841d] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300"
              >
                <Activity className="h-4 w-4 mr-2" />
                Feed
              </TabsTrigger>
              <TabsTrigger
                value="discussions"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#386641] data-[state=active]:to-[#2d5233] dark:data-[state=active]:from-[#FF9433] dark:data-[state=active]:to-[#e6841d] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussions
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#386641] data-[state=active]:to-[#2d5233] dark:data-[state=active]:from-[#FF9433] dark:data-[state=active]:to-[#e6841d] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#386641] data-[state=active]:to-[#2d5233] dark:data-[state=active]:from-[#FF9433] dark:data-[state=active]:to-[#e6841d] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300"
              >
                <Users className="h-4 w-4 mr-2" />
                Members
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Controls */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search community..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/80 dark:bg-[#1E2E26]/80 backdrop-blur-sm border-0 shadow-lg rounded-xl focus:ring-2 focus:ring-[#386641] dark:focus:ring-[#FF9433] transition-all duration-300"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-white/80 dark:bg-[#1E2E26]/80 backdrop-blur-sm border-0 shadow-lg rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="trending">Trending</SelectItem>
                </SelectContent>
              </Select>

              <Button className="bg-gradient-to-r from-[#386641] to-[#2d5233] dark:from-[#FF9433] dark:to-[#e6841d] hover:from-[#2d5233] hover:to-[#1f3d26] text-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </div>

          {/* Community Feed Tab */}
          <TabsContent value="feed" className="space-y-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main Feed */}
              <div className="lg:col-span-3 space-y-8">
                {/* Enhanced Create Post */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-[#1E2E26] dark:to-[#121212]/50 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-[#1E2E26] shadow-lg">
                        <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.firstName} />
                        <AvatarFallback className="bg-gradient-to-br from-[#386641] to-[#F97A00] text-white font-bold">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-4">
                        <Textarea
                          placeholder="Share your thoughts, showcase your work, or start a discussion..."
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          className="min-h-24 border-0 bg-gray-50 dark:bg-[#1E2E26]/50 rounded-xl resize-none focus:ring-2 focus:ring-[#386641] dark:focus:ring-[#FF9433] transition-all duration-300"
                        />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-[#386641] dark:text-[#FFD86B]/60 dark:hover:text-[#FF9433] hover:bg-[#386641]/10 dark:hover:bg-[#FF9433]/10 rounded-xl transition-all duration-300"
                            >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Photo
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-[#386641] dark:text-[#FFD86B]/60 dark:hover:text-[#FF9433] hover:bg-[#386641]/10 dark:hover:bg-[#FF9433]/10 rounded-xl transition-all duration-300"
                            >
                              <VideoIcon className="h-4 w-4 mr-2" />
                              Video
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-[#386641] dark:text-[#FFD86B]/60 dark:hover:text-[#FF9433] hover:bg-[#386641]/10 dark:hover:bg-[#FF9433]/10 rounded-xl transition-all duration-300"
                            >
                              <Code className="h-4 w-4 mr-2" />
                              Code
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-[#386641] dark:text-[#FFD86B]/60 dark:hover:text-[#FF9433] hover:bg-[#386641]/10 dark:hover:bg-[#FF9433]/10 rounded-xl transition-all duration-300"
                            >
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Poll
                            </Button>
                          </div>

                          <Button
                            onClick={handleCreatePost}
                            disabled={!newPostContent.trim() || isLoading}
                            className="bg-gradient-to-r from-[#386641] to-[#2d5233] dark:from-[#FF9433] dark:to-[#e6841d] hover:from-[#2d5233] hover:to-[#1f3d26] text-white shadow-lg hover:shadow-xl rounded-xl transition-all duration-300 disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            {isLoading ? "Posting..." : "Post"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Feed */}
                <div className="space-y-8">
                  {communityPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                {/* Trending Topics */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-[#1E2E26] dark:to-[#121212]/50 overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-[#FFD86B] flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-[#F97A00] dark:text-[#FF9433]" />
                      Trending Now
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trendingTopics.map((topic, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#1E2E26]/50 rounded-xl transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Hash className="h-3 w-3 text-[#386641] dark:text-[#FF9433]" />
                            <span className="font-medium text-gray-900 dark:text-[#FFD86B] group-hover:text-[#386641] dark:group-hover:text-[#FF9433] transition-colors">
                              {topic.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-600 dark:text-[#FFD86B]/70">{topic.posts} posts</span>
                            <Badge className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-0 text-xs">
                              {topic.growth}
                            </Badge>
                          </div>
                        </div>
                        <Flame className="h-4 w-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Suggested Connections */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-[#1E2E26] dark:to-[#121212]/50 overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-[#FFD86B] flex items-center">
                      <UserPlus className="h-5 w-5 mr-2 text-[#386641] dark:text-[#FF9433]" />
                      People to Follow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topMembers.slice(0, 3).map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-[#1E2E26]/50 rounded-xl transition-all duration-300"
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-[#1E2E26] shadow-lg">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.firstName} />
                            <AvatarFallback className="bg-gradient-to-br from-[#386641] to-[#F97A00] text-white font-bold">
                              {member.firstName?.[0]}
                              {member.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          {member.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
                              <Verified className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-[#FFD86B] truncate">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-[#FFD86B]/70 truncate">{member.title}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium">{member.reputation}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleFollowMember(member._id)}
                          className="bg-gradient-to-r from-[#386641] to-[#2d5233] dark:from-[#FF9433] dark:to-[#e6841d] hover:from-[#2d5233] hover:to-[#1f3d26] text-white text-xs px-3 py-1.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Follow
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-[#386641]/5 to-[#F97A00]/5 dark:from-[#FF9433]/5 dark:to-[#FFD86B]/5 overflow-hidden">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#386641] to-[#F97A00] dark:from-[#FF9433] dark:to-[#FFD86B] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900 dark:text-[#FFD86B]">Your Impact</p>
                      <p className="text-sm text-gray-600 dark:text-[#FFD86B]/70 mt-2">
                        You've helped 156 developers this month!
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-[#386641] dark:text-[#FF9433]">23</p>
                        <p className="text-xs text-gray-600 dark:text-[#FFD86B]/70">Posts</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#F97A00] dark:text-[#FF9433]">89</p>
                        <p className="text-xs text-gray-600 dark:text-[#FFD86B]/70">Likes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Enhanced Events Tab */}
          <TabsContent value="events" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          </TabsContent>

          {/* Enhanced Members Tab */}
          <TabsContent value="members" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {topMembers.map((member, index) => (
                <MemberCard key={member._id} member={member} rank={index + 1} />
              ))}
            </div>
          </TabsContent>

          {/* Enhanced Discussions Tab */}
          <TabsContent value="discussions" className="space-y-8">
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-[#FFD86B] mb-2">Discussions Coming Soon</h3>
              <p className="text-gray-600 dark:text-[#FFD86B]/70">
                We're working on bringing you organized discussion forums.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
