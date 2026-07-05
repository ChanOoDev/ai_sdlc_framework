# Next.js Skill

Use for Next.js App Router projects.

## Decision Trees

### Server vs Client Component

```
Does the component need useState/useEffect/event handlers?
├─ Yes → "use client" at top of file
└─ No → Default to Server Component

Does it fetch data?
├─ Yes → Server Component (fetch in component or Server Action)
└─ No → See above

Does it use browser APIs?
├─ Yes → "use client"
└─ No → Server Component
```

### Data Fetching

```
Is this a mutation (create/update/delete)?
├─ Yes → Use Server Action
│   └─ Form action → Server Action → revalidatePath/revalidateTag
└─ No → Is it static or dynamic?
    ├─ Static → fetch with { cache: 'force-cache' }
    ├─ Dynamic → fetch with { cache: 'no-store' } or dynamic = 'force-dynamic'
    └─ Time-based → fetch with { next: { revalidate: N } }
```

## Patterns

### Server Action Pattern

```typescript
// app/actions/patient.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createPatient(formData: FormData) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('patients')
    .insert({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/patients')
  return { data }
}
```

### Server Component with Data

```typescript
// app/(dashboard)/patients/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function PatientsPage() {
  const supabase = createClient()

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1>Patients</h1>
      {patients?.map(patient => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  )
}
```

### Validation Pattern

```typescript
// lib/validations/patient.ts
import { z } from 'zod'

export const patientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
})

export type PatientInput = z.infer<typeof patientSchema>
```

### Error Boundary Pattern

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

## Anti-Patterns

- ❌ Using `"use client"` unnecessarily (defaults to Server Components)
- ❌ Fetching data in useEffect when it could be a Server Component
- ❌ Exposing `SUPABASE_SERVICE_ROLE_KEY` to client components
- ❌ Using `window` or other browser APIs in Server Components
- ❌ Importing client-only libraries in Server Components without `"use client"`

## Checklist

- [ ] Server Components by default
- [ ] `"use client"` only when needed
- [ ] Server Actions for mutations
- [ ] Validation server-side and client-side
- [ ] No secrets in client components
- [ ] Error boundaries for each route group
- [ ] Loading states for async components
