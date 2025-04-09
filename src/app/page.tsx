import Link from "next/link"
import { Vote } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-green-50 to-white">
      <div className="w-full max-w-md border border-green-200 rounded-lg bg-white shadow-lg overflow-hidden">
        <div className="p-6 text-center">
          <h1 className="text-3xl font-bold text-green-700">Decentralized Voting</h1>
          <p className="text-gray-500 mt-2">
            Secure, transparent, and decentralized voting system powered by blockchain
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4 h-[120px] w-[120px] flex items-center justify-center">
              <Vote className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold text-green-800">Connect your wallet to continue</h2>
            <p className="text-sm text-gray-500">
              You need to connect your Ethereum wallet to access the voting platform
            </p>
          </div>
          <Link href="/connect">
            <button className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors">
              Connect Wallet
            </button>
          </Link>
          <div className="text-center text-xs text-gray-500 pt-4">
            <p>By connecting your wallet, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </main>
  )
}

