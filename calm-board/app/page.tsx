import Header from "@/components/header"
import InputCard from "@/components/input-card"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 via-green-50 to-blue-100 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <InputCard />
      </main>
      <Footer />
    </div>
  )
}
