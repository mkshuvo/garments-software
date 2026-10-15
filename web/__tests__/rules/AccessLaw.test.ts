/** @jest-environment node */
import { lawCases } from '../helpers/LawCases'

const CLIENT = 'src/api/ApiClient.ts'
const STORAGE_ZONE = 'src/api/AccessTokenStore.ts'
const ENV_FILE = 'src/api/ApiBaseUrl.ts'

describe('L12 no-direct-api-access', () => {
  lawCases('no-direct-api-access', {
    valid: [
      { code: 'const value = 1', filename: 'src/components/Case.tsx' },
      { code: "import axios from 'axios'\nexport const client = axios.create()", filename: CLIENT },
      { code: 'void apiClient.get("/ledger")', filename: 'src/components/Case.tsx' },
    ],
    invalid: [
      {
        code: 'export async function load() {\n  return fetch("/api/v1/trial-balance")\n}',
        errors: [{ messageId: 'rawCall' }],
      },
      {
        code: "import axios from 'axios'\nexport const second = axios.create()",
        errors: [{ messageId: 'rawModule' }],
      },
      {
        code: 'const request = new XMLHttpRequest()',
        errors: [{ messageId: 'rawCall' }],
      },
      {
        code: 'void window.fetch("/api/v1/accounts")',
        errors: [{ messageId: 'rawCall' }],
      },
    ],
  })
})

describe('L12 no-browser-storage', () => {
  lawCases('no-browser-storage', {
    valid: [
      { code: 'window.localStorage.setItem("token", value)', filename: STORAGE_ZONE },
      { code: 'const token = accessTokenStore.read()', filename: 'src/components/Case.tsx' },
    ],
    invalid: [
      { code: 'localStorage.getItem("cache")', errors: [{ messageId: 'storage' }] },
      { code: 'window.sessionStorage.clear()', errors: [{ messageId: 'storage' }] },
      { code: 'indexedDB.open("garments")', errors: [{ messageId: 'storage' }] },
    ],
  })
})

describe('L12 no-hardcoded-api-origin', () => {
  lawCases('no-hardcoded-api-origin', {
    valid: [
      { code: 'export const loginPath = "/api/v1/auth/login"', filename: 'src/api/AuthLoginPath.ts' },
      { code: 'const origin = process.env.NEXT_PUBLIC_API_BASE_URL', filename: 'src/components/Case.tsx' },
      { code: 'const pattern = /^https?:\\/\\//', filename: ENV_FILE },
    ],
    invalid: [
      { code: 'const base = "http://localhost:8080"', errors: [{ messageId: 'origin' }] },
      { code: 'const base = "http://127.0.0.1:8080/api"', errors: [{ messageId: 'origin' }] },
      { code: 'const base = `https://erp.internal:8443`', errors: [{ messageId: 'origin' }] },
      { code: 'const base = "erp.example.com:8080"', errors: [{ messageId: 'origin' }] },
    ],
  })
})