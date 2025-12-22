const BamzClient = (await import(`/bamz-lib/bamz-client.mjs`)).default ;

export default {
    globals: {
        bamz: new BamzClient()
    },
}
