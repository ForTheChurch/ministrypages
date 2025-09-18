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
- Remove all uses of Media (we don't have the ability to create those yet)
- Change hero so `type` can only be `lowImpact`. Media is not supported yet.
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
- Provide the ability to create things like media via tool call