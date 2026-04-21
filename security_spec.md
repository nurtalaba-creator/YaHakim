# Security Specification - Ya Hakeem

## Data Invariants
1. Doctors must have a valid specialty and location in both languages.
2. Articles must have content and a publication date.
3. Only authorized administrators can modify the directory or magazine.
4. Public users have read-only access to doctors and articles.

## The "Dirty Dozen" Payloads (Unauthorized Write Attempts)

1. **Identity Spoofing (Doctor)**: Anonymous user trying to create a doctor profile.
2. **Identity Spoofing (Article)**: Anonymous user trying to create an article.
3. **Privilege Escalation**: Anonymous user trying to update a doctor's specialty.
4. **Data Corruption (Doctor)**: Admin trying to set experience to a negative number.
5. **Data Corruption (Article)**: Admin trying to set an empty content_en.
6. **Shadow Field Injection**: Admin trying to add an `isAdmin: true` field to a doctor document.
7. **Bypassing Terminal State**: (N/A for this app as there are no status fields yet, but we'll protect the immutability of `publishedAt` for articles).
8. **Malicious ID Injection**: Trying to create a doctor with a 2MB string as an ID.
9. **Denial of Wallet**: Trying to upload a 1MB string into the `name_en` field.
10. **Orphaned Record**: Trying to create a doctor without a required field like `name_en`.
11. **Timestamp Spoofing**: Trying to set `publishedAt` to a future date manually (instead of using server time, though articles use strings right now, we should ideally use timestamps or strictly validate the format).
12. **Field Deletion**: Trying to delete a required field during an update.

## Test Runner (firestore.rules.test.ts)
```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'gen-lang-client-0450401962',
    firestore: {
      rules: '', // Loaded from firestore.rules
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

test('Public cannot write to doctors', async () => {
  const alice = testEnv.authenticatedContext('alice');
  await assertFails(setDoc(doc(alice.firestore(), 'doctors/doc1'), { name_en: 'Dr. Test' }));
});

test('Public can read doctors', async () => {
  const unauth = testEnv.unauthenticatedContext();
  await assertSucceeds(getDoc(doc(unauth.firestore(), 'doctors/doc1')));
});
```
