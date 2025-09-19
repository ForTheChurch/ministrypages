# Prompts for agents
This contains some documentaiton regarding the prompts.

# convert-page.md
For `page-types.ts`, I copied the relevant types from `payload-types.ts` but had to make additional modifications.


**Remove these fields**
```
"id": "our-beliefs-page",
"slug": "our-beliefs",
"publishedAt": "2024-01-01T00:00:00.000Z",
"updatedAt": "2024-01-01T00:00:00.000Z",
"createdAt": "2024-01-01T00:00:00.000Z",
"_status": "published"
"meta": ...
"publishedAt": ...
```


**Other changes**
- Remove ids of nested things
- Tweak `Media` uses so that it's only the string (id) and not the object. Remove the `Media` object.
- Comment `// Media ID` where media string is used
- Add note to hero media: `// Media ID - required if hero is type 'highImpact' or 'mediumImpact'`
- Comment that children can't can't have nested children.
```
            children: { // This can't have nested children
              type: string;
              version: number;
              [k: string]: unknown;
            }[];
```


**Future considerations**
- Provide the name of the church