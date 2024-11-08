import AuctionDetail from '@/components/AuctionDetail'
import React from 'react'


export default function page({params}: {params: {id: number}}) {
  return (
    <div className='mx-auto p-4'>
        <AuctionDetail auctionId={params.id}/>
    </div>
  )
}
