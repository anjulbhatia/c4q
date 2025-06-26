// app/page.tsx
"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileIcon, MessageSquareIcon, BarChart2Icon, UserIcon, UploadCloudIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import Papa from "papaparse"

// Define message and viz types
type Message = { role: "user" | "bot", content: string }
type Viz = { title: string, chartSpec: any }

export default function AppPage() {
  const [activeTab, setActiveTab] = useState("data")
  const [hasData, setHasData] = useState(false)
  const [dataHeaders, setDataHeaders] = useState<string[]>([])
  const [dataRows, setDataRows] = useState<any[][]>([])

  const [chatInput, setChatInput] = useState("")
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [vizStore, setVizStore] = useState<Viz[]>([])

  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleUploadClick = () => inputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ""

    if (file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = results.data as Record<string, string>[]
          if (parsed && parsed.length > 0) {
            setDataHeaders(Object.keys(parsed[0]))
            setDataRows(parsed.map((row) => Object.values(row)))
            setHasData(true)
          } else {
            alert("No data found in file.")
          }
        },
        error: (err) => alert(`Error parsing CSV: ${err.message}`)
      })
    } else {
      alert("Only CSV file support is currently implemented.")
    }
  }

  const handleChatSend = async () => {
    if (!chatInput.trim()) return

    const newUserMessage: Message = { role: "user", content: chatInput }
    setChatHistory(prev => [...prev, newUserMessage])
    setChatInput("")

    try {
      const genRes = await fetch("http://localhost:8000/generate_sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: chatInput })
      })

      const genData = await genRes.json()
      const sql = genData.sql
      if (!sql) throw new Error("No SQL generated")

      setChatHistory(prev => [...prev, { role: "bot", content: `🧠 Generated SQL:\n\
\
${sql}` }])

      const runRes = await fetch("http://localhost:8000/run_sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql })
      })

      const { data, columns } = await runRes.json()
      if (!data || data.length === 0) throw new Error("No data returned.")

      const chartRes = await fetch("http://localhost:8000/explain_chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: chatInput, data, columns })
      })

      const { chart, explanation } = await chartRes.json()

      if (explanation) setChatHistory(prev => [...prev, { role: "bot", content: explanation }])

      if (chart) {
        setVizStore(prev => [...prev, { title: chatInput, chartSpec: chart }])
      }
    } catch (err) {
      console.error("Chat error:", err)
      setChatHistory(prev => [...prev, { role: "bot", content: "❌ Could not process your request." }])
    }
  }

  return (
    <main className="flex h-screen overflow-hidden bg-white text-black">
      {/* Sidebar */}
      <aside className="group w-16 hover:w-48 transition-all duration-300 ease-in-out border-r border-gray-200 bg-gray-50 p-2 overflow-hidden">
        <div className="text-xl font-bold text-indigo-600 px-2 mb-4">C4Q</div>
        <nav className="flex flex-col gap-2">
          <button onClick={() => setActiveTab("chat")} className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-200 ${activeTab === "chat" ? "bg-gray-200 font-medium" : ""}`}>
            <MessageSquareIcon size={18} />
            <span className="hidden group-hover:inline">Chat</span>
          </button>
          <button onClick={() => setActiveTab("data")} className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-200 ${activeTab === "data" ? "bg-gray-200 font-medium" : ""}`}>
            <FileIcon size={18} />
            <span className="hidden group-hover:inline">Data</span>
          </button>
          <button onClick={() => setActiveTab("viz")} className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-200 ${activeTab === "viz" ? "bg-gray-200 font-medium" : ""}`}>
            <BarChart2Icon size={18} />
            <span className="hidden group-hover:inline">Visualization</span>
          </button>
        </nav>
      </aside>

      {/* Main Panel */}
      <section className="flex-1 flex flex-col">
        <header className="w-full px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h1 className="text-lg font-semibold text-indigo-600">ChartsFromQuery</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="text-xs">Tools</div>
            <div className="flex items-center gap-2">
              <UserIcon size={18} /> Guest
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {/* Data Tab */}
          {activeTab === "data" && (!hasData ? (
            <div className="flex flex-col items-center justify-center h-full text-center border border-dashed border-gray-300 rounded-lg p-10">
              <UploadCloudIcon className="w-10 h-10 text-gray-400 mb-4" />
              <p className="text-xl mb-2">Upload data in CSV</p>
              <Button variant="outline" onClick={handleUploadClick} className="mb-2">Select File</Button>
              <input ref={inputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              <p className="text-sm text-gray-500">Accepted formats: CSV (Excel soon)</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <select className="border rounded px-2 py-1 text-sm">
                  <option>Uploaded Data</option>
                </select>
                <Button variant="outline" size="sm">Add Data</Button>
              </div>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {dataHeaders.map((header, idx) => (
                        <TableHead key={idx}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataRows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto mb-4 border p-4 rounded-lg space-y-4 bg-gray-50">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`text-sm ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <span className={`inline-block px-3 py-2 rounded-lg ${msg.role === "user" ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-700"}`}>
                      {msg.content}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask your data anything..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                />
                <Button onClick={handleChatSend}>Send</Button>
              </div>
            </div>
          )}

          {/* Visualization Tab */}
          {activeTab === "viz" && (
            <div className="space-y-6">
              {vizStore.length === 0 ? (
                <div className="text-gray-400 text-center pt-20">No visualizations yet.</div>
              ) : (
                vizStore.map((viz, idx) => (
                  <div key={idx} className="border p-4 rounded shadow bg-white">
                    <h2 className="text-sm font-semibold mb-2">{viz.title}</h2>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">{JSON.stringify(viz.chartSpec, null, 2)}</pre>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
