
export default function Home() {
    const squares: number[] = []
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            squares.push(rank * 8 + file)
        }
    }

    return <div className='grid grid-cols-8 w-fit'>
        {squares.map((squareIndex) =>
            <div className='w-20 h-20 bg-blue-900 border border-gray-500' key={squareIndex}>
                {squareIndex}
            </div>
        )}
    </div>
}
