"use client"

import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Send, MessageCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Components } from "react-markdown"
import remarkGfm from "remark-gfm"

export default function TrustGPTChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto max-w-4xl px-4 py-4">
        {/* Header - Horizontal layout */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <svg
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 545.3 164.1"
            width="120"
            height="36"
            xmlSpace="preserve"
          >
            <style type="text/css">
              {`.improving-primary-st0{fill:#005596;}
              .improving-primary-st1{fill:#00A4E4;}`}
            </style>
            <g>
              <g>
                <path
                  className="improving-primary-st0"
                  d="M452.1,10.5c0.9-3.8,4.7-6.1,8.5-5.2c3.8,0.9,6.1,4.7,5.2,8.5c-0.9,3.8-21.4,60.2-21.4,60.2 S451.2,14.3,452.1,10.5z"
                ></path>
                <path
                  className="improving-primary-st0"
                  d="M415.6,23.6c-1.2-3.7,0.9-7.7,4.6-8.8c3.7-1.2,7.7,0.9,8.8,4.6c1.2,3.7,10.1,56,10.1,56 S416.7,27.3,415.6,23.6z"
                ></path>
                <path
                  className="improving-primary-st0"
                  d="M390.1,54.7c-3.1-2.3-3.8-6.7-1.5-9.9c2.3-3.1,6.7-3.8,9.8-1.5c3.1,2.3,35.6,34.9,35.6,34.9 S393.2,57,390.1,54.7z"
                ></path>
                <path
                  className="improving-primary-st0"
                  d="M391.3,91.7c-3.9,0-7-3.2-7-7.1c0-3.9,3.2-7.1,7.1-7c3.9,0,42.2,7.1,42.2,7.1S395.2,91.7,391.3,91.7z"
                ></path>
                <path
                  className="improving-primary-st0"
                  d="M415.2,119.5c-2.8,2.7-7.3,2.5-9.9-0.3c-2.7-2.9-2.5-7.3,0.3-10c2.8-2.7,30.5-19,30.5-19 S418,116.9,415.2,119.5z"
                ></path>
                <path
                  className="improving-primary-st0"
                  d="M448.8,119.3c0.1,3.7-2.9,6.8-6.6,6.9c-3.7,0.1-6.8-2.9-6.9-6.6c-0.1-3.7,6.2-27.2,6.2-27.2 S448.8,115.6,448.8,119.3z"
                ></path>
                <path
                  className="improving-primary-st0"
                  d="M526.5,41.3c3.6-1.6,7.8,0,9.4,3.6c1.6,3.6-0.1,7.8-3.7,9.3c-3.6,1.6-79.9,27.6-79.9,27.6 S522.9,42.9,526.5,41.3z"
                ></path>
                <path
                  className="improving-primary-st0"
                  d="M491.3,17.8c2.7-3.1,7.2-3.6,10.2-1c2.9,2.5,3.1,7.1,0.5,10.2c-2.7,3.1-52.6,50.2-52.6,50.2 S488.6,20.9,491.3,17.8z"
                ></path>
              </g>
              <g>
                <polygon
                  className="improving-primary-st1"
                  points="22.2,141.1 15.2,141.1 15.2,104.3 11.5,102.9 11.5,98.3 22.3,98.3"
                ></polygon>
                <path
                  className="improving-primary-st1"
                  d="M97,141.2l-7.2,0l0-25.8c0-4.2-0.7-7.2-2.1-9.1c-1.4-1.9-3.8-2.8-7.2-2.9c-2.8,0-5.3,0.8-7.3,2.5 c-1.7,1.4-2.9,3.1-3.6,5.2l0,29.9l-7.2,0l0-25.8c0-4.2-0.7-7.2-2.1-9.1c-1.4-1.9-3.8-2.8-7.2-2.9c-2.8,0-5.3,0.8-7.3,2.5 c-1.7,1.4-2.9,3.1-3.6,5.2l0,30l-7,0l0.1-42.8l3.5,0l2.3,4.4c3.3-3.5,7.3-5.3,12.1-5.3c3,0,5.7,0.6,8.3,1.8 c2.6,1.2,4.5,2.8,5.8,4.8c3.5-4.4,7.9-6.5,13.3-6.5c11,0,16.5,5.6,16.5,16.8L97,141.2z"
                ></path>
                <path
                  className="improving-primary-st1"
                  d="M148.6,119.5c0,6.6-1.6,11.9-4.7,15.8c-3.5,4.4-8.6,6.6-15.3,6.6c-4.2,0-8.3-1.2-12.5-3.7l0,20.4l-7,0 l0.1-60.2l4.3,0l1.7,4.5c1.1-1.3,2.7-2.5,4.8-3.5c2.6-1.3,5.4-1.9,8.4-1.9c6.5,0,11.5,1.9,15,5.6 C146.9,106.9,148.6,112.4,148.6,119.5z M141.4,119.5c0-10.7-4.4-16.1-13.2-16.1c-2.8,0-5.5,0.9-7.9,2.7c-2,1.5-3.4,3-4.1,4.8 l0,19.8c4.2,3.6,8.3,5.4,12.3,5.4C137.1,136.2,141.4,130.6,141.4,119.5z"
                ></path>
                <path
                  className="improving-primary-st1"
                  d="M184.6,99.2l-1.8,5.9c-2-0.9-4-1.3-6.1-1.3c-2.6,0-5,0.8-7.1,2.4c-1.8,1.4-3,3-3.6,4.9l0,30.2l-7,0l0.1-42.8 l3.7,0l1.3,4.6c1.1-1.3,2.7-2.5,4.9-3.6c2.6-1.3,5.1-1.9,7.8-1.9C179.3,97.7,182,98.2,184.6,99.2z"
                ></path>
                <path
                  className="improving-primary-st1"
                  d="M227.7,119.8c0,7-1.6,12.4-4.7,16.2c-3.4,4.1-8.4,6.2-15.1,6.2c-6.6,0-11.6-2.1-15-6.3 c-3.1-3.8-4.6-9.2-4.6-16.2c0-6.6,1.5-11.8,4.5-15.5c3.4-4.4,8.4-6.5,15.2-6.5c6.5,0,11.5,2.2,15,6.5 C226.1,108.1,227.7,113.3,227.7,119.8z M220.5,119.8c0-10.9-4.2-16.3-12.5-16.3c-8.3,0-12.5,5.4-12.5,16.3c0,5.6,0.9,9.7,2.8,12.3 c2,2.9,5.2,4.4,9.7,4.4c4.6,0,7.9-1.4,9.8-4.4C219.5,129.4,220.4,125.3,220.5,119.8z"
                ></path>
                <path
                  className="improving-primary-st1"
                  d="M273.1,98.7l-14.8,42.7l-10,0l-14.5-42.8l7.5,0l12.1,37.2l12.3-37.2L273.1,98.7z"
                ></path>
                <polygon
                  className="improving-primary-st1"
                  points="291.4,141.5 284.3,141.5 284.4,104.6 280.6,103.2 280.6,98.7 291.4,98.7"
                ></polygon>
                <path
                  className="improving-primary-st1"
                  d="M340.5,141.5l-7.2,0l0-25.8c0-8-3.3-12-9.9-12c-3,0-5.6,0.8-8,2.5c-2.1,1.6-3.5,3.3-4.1,5.2l0,30l-7,0 l0.1-42.8l4.4,0l1.5,4.7c1.2-1.5,3-2.7,5.2-3.7c2.6-1.2,5.3-1.8,8-1.8c11.4,0,17.1,5.6,17.1,16.8L340.5,141.5z"
                ></path>
                <path
                  className="improving-primary-st1"
                  d="M390.9,98.8l-0.1,41.6c0,5.9-1.7,10.5-5.2,14c-3.5,3.4-8.3,5.1-14.6,5.1c-5,0-9.7-1.7-14-5.1l3.8-5.4 c3.5,2.7,6.8,4.1,10.1,4.1c8.5,0,12.8-4.3,12.8-13.1l0-3.5c-3.6,3-7.8,4.4-12.5,4.4c-5.7,0-10.3-2.1-14-6.2 c-3.6-4.1-5.4-9.3-5.4-15.6c0-6.6,1.7-11.9,5.2-15.7c3.4-3.8,8.4-5.7,15-5.7c4.6,0,8.7,1.3,12.4,3.9l1.6-3L390.9,98.8z  M383.8,129.5l0-20.2c-1-1.1-2.5-2.1-4.4-3.1c-2.7-1.4-5.2-2.1-7.7-2.1c-8.5,0-12.8,5-12.8,15.2c0,4.5,1,8.2,3,10.9 c2.2,3,5.4,4.5,9.7,4.6C376,134.8,380.1,133,383.8,129.5z"
                ></path>
              </g>
            </g>
          </svg>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#005596]">TrustGPT</h1>
            <p className="text-sm text-[#00A4E4] font-medium italic">"Trust changes everything"</p>
          </div>
        </div>

        {/* Chat Container - Adjusted height */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 bg-[#005596]/5 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#005596]" />
              <span className="font-semibold text-[#005596] text-sm">Trust Conversation</span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages Area - Decreased height */}
            <div className="h-[500px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-[#00A4E4]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-6 w-6 text-[#00A4E4]" />
                  </div>
                  <h3 className="text-base font-semibold text-[#005596] mb-1">Welcome to TrustGPT</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    I'm here to help you build, restore, and leverage trust. Ask me about trust challenges in your
                    relationships, workplace, or organization.
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg mx-auto">
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                      "How can I rebuild trust with my team?"
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                      "What are the key trust behaviors?"
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-[#005596] text-white [&_*]:text-white [&_code]:bg-white/10 [&_pre]:bg-white/10"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 bg-[#00A4E4] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">T</span>
                        </div>
                        <span className="text-xs font-semibold text-[#005596]">TrustGPT</span>
                      </div>
                    )}
                    <div>
                      {message.parts.map((part, i) => {
                        if (part.type === "text") {
                          const components: Components = {
                            p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-1">{children}</ol>,
                            li: ({ children }) => <li className="mb-0.5">{children}</li>,
                            code: ({ children }) => (
                              <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-gray-100 dark:bg-gray-800 rounded p-1.5 mb-1 overflow-x-auto">
                                {children}
                              </pre>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-1.5">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-gray-50">
                                {children}
                              </thead>
                            ),
                            tbody: ({ children }) => (
                              <tbody className="bg-white divide-y divide-gray-200">
                                {children}
                              </tbody>
                            ),
                            tr: ({ children }) => (
                              <tr className="hover:bg-gray-50">
                                {children}
                              </tr>
                            ),
                            th: ({ children }) => (
                              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-2 py-1 text-sm text-gray-900 whitespace-nowrap">
                                {children}
                              </td>
                            ),
                            h1: ({ children }) => <h1 className="text-xl font-bold mb-1">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-bold mb-1">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-bold mb-1">{children}</h3>,
                            h4: ({ children }) => <h4 className="text-sm font-bold mb-1">{children}</h4>,
                            h5: ({ children }) => <h5 className="text-xs font-bold mb-1">{children}</h5>,
                            h6: ({ children }) => <h6 className="text-xs font-bold mb-1">{children}</h6>,
                          }
                          return (
                            <div key={i} className="prose prose-sm dark:prose-invert max-w-none [&_*]:!my-0 [&_*]:!mt-0 [&_p]:!mb-1 [&_ul]:!mb-1 [&_ol]:!mb-1 [&_pre]:!mb-1 [&_table]:!mb-1">
                              <ReactMarkdown 
                                components={components}
                                remarkPlugins={[remarkGfm]}
                              >
                                {part.text}
                              </ReactMarkdown>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-[#00A4E4] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">T</span>
                      </div>
                      <span className="text-xs font-semibold text-[#005596]">TrustGPT</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#00A4E4] rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-[#00A4E4] rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-[#00A4E4] rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 p-4 bg-gray-50/50">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask me about building trust..."
                  className="flex-1 border-gray-200 focus:border-[#00A4E4] focus:ring-[#00A4E4]/20"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-[#005596] hover:bg-[#004080] text-white px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <div className="mt-4 space-y-3">
                <p className="text-xs text-gray-500 text-center">
                  TrustGPT is designed to help you build trust. Remember: trust changes everything.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#005596]/5 rounded-lg p-3 border border-[#005596]/10">
                    <div className="flex items-center gap-2 text-[#005596]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs font-medium">Data Privacy Notice</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 ml-6">
                      We do not collect, store, or share any of your conversation data. All interactions are processed in real-time and are not retained.
                    </p>
                  </div>
                  <div className="bg-[#005596]/5 rounded-lg p-3 border border-[#005596]/10">
                    <div className="flex items-center gap-2 text-[#005596]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs font-medium">Environmental Impact</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 ml-6">
                      Each conversation generates approximately 0.0023 kg of CO₂. We're committed to minimizing our environmental impact while providing value.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
