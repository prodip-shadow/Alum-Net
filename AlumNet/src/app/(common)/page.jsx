import Usercard from '@/components/cards/Usercard';
import { authOptions } from '@/lib/authOptions';
import { getServerSession } from 'next-auth';
import React from 'react';

const HomePage =async () => {
    const session=await getServerSession(authOptions)
    return (
      <div>
        
          <h2>Server session</h2>
          <div>{JSON.stringify(session)}</div>
      
                
        
        <Usercard />
      </div>
    );
};

export default HomePage;