## Example

```typescript
import { sendMessage } from '@maddsua/botsender';

const { ok, errors } = await sendMessage({
  token: '123:abcd',
  chats: [000000, 'username'],
  content: 'This is a test message',
});
```

It's really that simple.
