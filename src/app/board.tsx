'use client';

import interpolate from 'color-interpolate';
import { ChangeEvent, useState } from 'react';

export const Board = () => {
    const squares: number[] = []
    const [values, setValues] = useState<number[]>([])
    const [result, setResult] = useState('')
    const [maxValue, setMaxValue] = useState(0)
    const [inputValue, setInputValue] = useState('')

    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            squares.push(rank * 8 + file)
        }
    }

    const updateMaxValue = (values: number[]) => {
        let maxValue = 0;
        for (let i = 0; i < 64; i++) {
            if (values[i] > maxValue) {
                maxValue = values[i]
            }
        }
        setMaxValue(maxValue)
    }

    const generate = (newValues: number[]) => {
        const numBits = Math.ceil(Math.log2(maxValue + 1))
        let longs: bigint[] = []

        for (let squareIndex = 63; squareIndex >= 0; squareIndex--) {
            const value = newValues[squareIndex] ?? 0;
            const binary = value.toString(2).padStart(numBits, '0')

            for (let longIndex = 0; longIndex < numBits; longIndex++) {
                const bit = binary.charAt(longIndex)
                const long = longs[longIndex] ?? 0n

                if (bit === '1') {
                    const newLong = long | (1n << BigInt(squareIndex))
                    longs[longIndex] = newLong
                } else {
                    const newLong = long & ~(1n << BigInt(squareIndex))
                    longs[longIndex] = newLong
                }
            }
        }

        setResult(longs.map(long => `0x${long.toString(16)}`).join(', '))
        updateMaxValue(newValues);
    }

    const updateValues = (event: ChangeEvent<HTMLInputElement>, squareIndex: number) => {
        const newValues = [...values]
        newValues[squareIndex] = parseInt(event.target.value)
        setValues(newValues)
        generate(newValues);
        setInputValue('')
    }

    const parseValuesFromString = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value);
        const splitValues = value.split(',').map(value => value.trim())
        var bigInts = splitValues.map(value => BigInt(value))

        let newValues: number[] = []
        for (let squareIndex = 63; squareIndex >= 0; squareIndex--) {
            newValues[squareIndex] = getValueFromLongs(bigInts, squareIndex)
        }
        setValues(newValues);
        updateMaxValue(newValues);
    }

    const getValueFromLongs = (longs: bigint[], squareIndex: number) => {
        const binary = longs.map(long => ((long >> BigInt(squareIndex)) & 1n) !== 0n ? '1' : '0').join('')
        return parseInt(binary, 2)
    }

    return <div className='flex'>
        <div className='grid grid-cols-8 w-fit'>
            {squares.map((squareIndex) => {
                const colormap = interpolate(['#353535', '#00a2ff'])
                const value = values[squareIndex] ?? 0
                const percentage = maxValue !== 0 ? value / maxValue : 0;
                const color = colormap(percentage)

                return <div className='flex justify-center items-center w-20 h-20 border border-gray-500 relative' style={{ backgroundColor: color }} key={squareIndex}>
                    <div className='absolute top-1 left-1 text-xs'>{squareIndex}</div>
                    <input type='number' className='bg-white text-black max-w-[30px]' size={2} value={value} onChange={(e) => updateValues(e, squareIndex)} />
                </div>
            })}
        </div>
        <div className='p-5 flex-1'>
            <h1 className='font-bold text-lg mb-2'>MultiBitsBoard Generator</h1>
            <div>This is a tool for generating MultiBitsBoards, which are used to store N bits of data in each square of a chessboard, using N longs.</div>
            <div>They aren&apos;t very useful in normal chess programming - Compared to a normal array of data they are more computationally expensive to read, and harder to work with. However for https://github.com/SebLague/Chess-Challenge where we need to hardcode this data with as few tokens as possible, it can be useful.</div>
            <div className='mt-5 font-mono'>Result: {result}</div>
            <input className='mt-5 bg-white text-black font-mono w-full' value={inputValue} onChange={parseValuesFromString}></input>
        </div>
    </div >

}