import { Navigation } from '@/components/Navigation'
import { ScrollVideo } from '@/components/ScrollVideo'
import { Closing } from '@/components/Closing'

export default function Page() {
  return (
    <>
      <Navigation />
      <main id="top">
        <ScrollVideo />
        <Closing />
      </main>
    </>
  )
}
