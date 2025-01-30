import dynamic from "next/dynamic"

const TelestoEnergyScene = dynamic(() => import("./components/telesto-energy-scene"), { ssr: false })

export default function LoadingPage() {
  return (
    <main>
      <TelestoEnergyScene />
    </main>
  )
}

