import { useState } from 'react'

export default function ProcessingDesk({ pkg, onDone }) {
    const [printed, setPrinted] = useState(false);

    return (
        <div style={{ padding: 20 }}>
            <h2>processing package</h2>
            <p>destination: {pkg.destination}</p>
            <p>fragile: {pkg.fragile ? 'yes' : 'no'}</p>

            {!printed ? (
                <button onClick={() => setPrinted(true)}>
                    print paper
                </button>
            ) : (
                <>
                    <p>paper printed</p>
                    <button onClick={onDone}>
                        send to {pkg.destination}
                    </button>
                </>
            )}
        </div>
    )
}