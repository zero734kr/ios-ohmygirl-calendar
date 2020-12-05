import Collection from "@discordjs/collection"

class Cache extends Collection<string | number | symbol, unknown> {
    public ttl: number
    public timeouts: Record<string | number | symbol, NodeJS.Timeout>

    constructor(ttl?: number) {
        super()

        if(typeof ttl !== "number") throw new TypeError("Invalid Type: 'ttl' must be number.")

        this.ttl = ttl
        this.timeouts = {}
    }

    set(key: string, value: unknown): this {
        super.set(key, value)

        this.timeouts[key] = setTimeout(() => {
            super.delete(key)
        }, this.ttl)

        return this
    }

    delete(key: string): boolean {
        const timeout = this.timeouts[key]
        if (timeout) {
            clearTimeout(timeout)
            delete this.timeouts[key]
        }

        return super.delete(key)
    }

    clear(): void {
        const timeouts = Object.values(this.timeouts)

        for (const timeout of timeouts) clearTimeout(timeout)
        this.timeouts = {}

        super.clear()
    }
}

export default Cache