'use client'

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/frontend/app'), { ssr: false });
function Home() {
  return (
    <App />
  )
}

export default Home;