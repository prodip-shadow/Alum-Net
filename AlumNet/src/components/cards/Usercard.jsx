'use client'
import { useSession } from 'next-auth/react';
import React from 'react';

const Usercard = () => {
    const session=useSession()
    return (
        <div>
            <h2>Client session</h2>
            <div>{ JSON.stringify(session)}</div>
        </div>
    );
};

export default Usercard;