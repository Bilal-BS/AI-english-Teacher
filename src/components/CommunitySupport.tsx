import React from 'react';
import { X, Users, MessageCircle, Heart, Star, Trophy } from 'lucide-react';

interface CommunitySupportProps {
  onClose: () => void;
}

export default function CommunitySupport({ onClose }: CommunitySupportProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Community Support</h2>
              <p className="text-gray-600">Connect with fellow learners and get help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">12,847</p>
                  <p className="text-blue-700">Active Learners</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">3,421</p>
                  <p className="text-green-700">Questions Answered</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center space-x-3">
                <Heart className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">98%</p>
                  <p className="text-purple-700">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Discussions */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Discussions</h3>
            <div className="space-y-4">
              {[
                {
                  title: "How to improve pronunciation of 'th' sounds?",
                  author: "Sarah M.",
                  replies: 12,
                  time: "2 hours ago",
                  category: "Pronunciation"
                },
                {
                  title: "Best strategies for memorizing irregular verbs",
                  author: "Mike Chen",
                  replies: 8,
                  time: "4 hours ago",
                  category: "Grammar"
                },
                {
                  title: "Looking for conversation practice partners",
                  author: "Elena R.",
                  replies: 15,
                  time: "6 hours ago",
                  category: "Speaking"
                },
                {
                  title: "Recommended resources for business English",
                  author: "David K.",
                  replies: 6,
                  time: "1 day ago",
                  category: "Business"
                }
              ].map((discussion, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{discussion.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>by {discussion.author}</span>
                        <span>{discussion.replies} replies</span>
                        <span>{discussion.time}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {discussion.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Contributors This Week</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Alex Thompson", points: 245, badge: "Expert Helper", avatar: "AT" },
                { name: "Maria Garcia", points: 198, badge: "Grammar Guru", avatar: "MG" },
                { name: "James Wilson", points: 167, badge: "Pronunciation Pro", avatar: "JW" },
                { name: "Lisa Chang", points: 134, badge: "Vocabulary Master", avatar: "LC" }
              ].map((contributor, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {contributor.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{contributor.name}</p>
                    <p className="text-sm text-gray-600">{contributor.badge}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">{contributor.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Ask a Question</span>
            </button>
            <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Join Study Group</span>
            </button>
            <button className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>View Leaderboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}