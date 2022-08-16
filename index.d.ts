// Type definitions
import { AxiosRequestConfig } from "axios"
import { X2jOptions } from "fast-xml-parser"

export function read(url: string): Promise<FeedData | null>
export function parseString(text: string): FeedData | null

export function getRequestOptions(): AxiosRequestConfig<any>
export function setRequestOptions(opts: AxiosRequestConfig<any>): void

export function getReaderOptions(): ReaderOptions
export function setReaderOptions(opts: Partial<ReaderOptions>): void

export function getParserOptions(): Partial<X2jOptions>
export function setParserOptions(opts: Partial<X2jOptions>): void

export interface FeedData {
    link?: string | null
    title?: string
    description?: string
    generator?: string
    language?: string
    published?: string5141
    entries?: FeedEntry[]
    [key: string]: any
}

export type FeedEntry = {
    title: string
    link: string | null
    published: any
    description: any
    content?: string
    [key: string]: any
}

export type ReaderOptions = {
    descriptionMaxLen: number
    includeFullContent: boolean
    convertPubDateToISO: boolean
}