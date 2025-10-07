export const pageTypePrompt = `
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "pages".
 */
export interface Page {
  title: string;
  hero: {
    type: 'none' | 'highImpact' | 'mediumImpact' | 'lowImpact';
    richText?: {
      root: {
        type: string;
        children: { // This can't have nested children
          type: string;
          version: number;
          [k: string]: unknown;
        }[];
        direction: ('ltr' | 'rtl') | null;
        format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
        indent: number;
        version: number;
      };
      [k: string]: unknown;
    } | null;
    links?:
      | {
          link: {
            type?: ('reference' | 'custom') | null;
            newTab?: boolean | null;
            reference?:
              | ({
                  relationTo: 'pages';
                  value: string | Page;
                } | null)
              | ({
                  relationTo: 'posts';
                  value: string | Post;
                } | null);
            url?: string | null;
            label: string;
            /**
             * Choose how the link should be rendered.
             */
            appearance?: ('default' | 'outline') | null;
          };
          id?: string | null;
        }[]
      | null;
    media?: string | null;  // Media ID - required if hero is type 'highImpact' or 'mediumImpact'
  };
  layout: (
    | TwoColumn
    | ImageBanner
    | CallToActionBlock
    | ContentBlock
    | MediaBlock
    | PostListBlock
    | EventListBlock
    | FormBlock
  )[];
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "posts".
 */
export interface Post {
  title: string;
  heroImage?: string | null;  // Media ID
  content: {
    root: {
      type: string;
      children: { // This can't have nested children
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  };
  relatedPosts?: (string | Post)[] | null;
  series?: (string | null) | Series;
  categories?: (string | Category)[] | null;
  authors?: (string | User)[] | null;
  populatedAuthors?:
    | {
        id?: string | null;
        name?: string | null;
      }[]
    | null;
  slug?: string | null;
  slugLock?: boolean | null;
  updatedAt: string;
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "series".
 */
export interface Series {
  id: string;
  title: string;
  image?: string | null;  // Media ID
  description: string;
  slug?: string | null;
  slugLock?: boolean | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "categories".
 */
export interface Category {
  id: string;
  title: string;
  slug?: string | null;
  slugLock?: boolean | null;
  parent?: (string | null) | Category;
  breadcrumbs?:
    | {
        doc?: (string | null) | Category;
        url?: string | null;
        label?: string | null;
        id?: string | null;
      }[]
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "users".
 */
export interface User {
  id: string;
  name?: string | null;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  sessions?:
    | {
        id: string;
        createdAt?: string | null;
        expiresAt: string;
      }[]
    | null;
  password?: string | null;
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "TwoColumn".
 */
export interface TwoColumn {
  image?: string | null;  // Media ID
  /**
   * Choose where the image should be on larger screens.
   */
  imagePosition?: ('left' | 'right') | null;
  /**
   * Choose where the image should be on mobile screens.
   */
  imagePositionOnMobile?: ('top' | 'bottom') | null;
  richText?: {
    root: {
      type: string;
      children: { // This can't have nested children
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  /**
   * Center the text on mobile screens.
   */
  centerTextOnMobile?: boolean | null;
  sectionColor?: ('none' | 'accent' | 'secondary' | 'dark') | null;
  enableLink?: boolean | null;
  link?: {
    type?: ('reference' | 'custom') | null;
    newTab?: boolean | null;
    reference?:
      | ({
          relationTo: 'pages';
          value: string | Page;
        } | null)
      | ({
          relationTo: 'posts';
          value: string | Post;
        } | null);
    url?: string | null;
    label: string;
    /**
     * Choose how the link should be rendered.
     */
    appearance?: ('default' | 'outline') | null;
  };
  id?: string | null;
  blockName?: string | null;
  blockType: 'twoColumn';
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "ImageBanner".
 */
export interface ImageBanner {
  image: string;  // Media ID
  richText?: {
    root: {
      type: string;
      children: { // This can't have nested children
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  links?:
    | {
        link: {
          type?: ('reference' | 'custom') | null;
          newTab?: boolean | null;
          reference?:
            | ({
                relationTo: 'pages';
                value: string | Page;
              } | null)
            | ({
                relationTo: 'posts';
                value: string | Post;
              } | null);
          url?: string | null;
          label: string;
          /**
           * Choose how the link should be rendered.
           */
          appearance?: ('default' | 'outline') | null;
        };
        id?: string | null;
      }[]
    | null;
  blockName?: string | null;
  blockType: 'imageBanner';
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "CallToActionBlock".
 */
export interface CallToActionBlock {
  richText?: {
    root: {
      type: string;
      children: { // This can't have nested children
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  links?:
    | {
        link: {
          type?: ('reference' | 'custom') | null;
          newTab?: boolean | null;
          reference?:
            | ({
                relationTo: 'pages';
                value: string | Page;
              } | null)
            | ({
                relationTo: 'posts';
                value: string | Post;
              } | null);
          url?: string | null;
          label: string;
          /**
           * Choose how the link should be rendered.
           */
          appearance?: ('default' | 'outline') | null;
        };
        id?: string | null;
      }[]
    | null;
  id?: string | null;
  blockName?: string | null;
  blockType: 'cta';
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "ContentBlock".
 */
export interface ContentBlock {
  columns?:
    | {
        size?: ('oneThird' | 'half' | 'twoThirds' | 'full') | null;
        richText?: {
          root: {
            type: string;
            children: { // This can't have nested children
              type: string;
              version: number;
              [k: string]: unknown;
            }[];
            direction: ('ltr' | 'rtl') | null;
            format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
            indent: number;
            version: number;
          };
          [k: string]: unknown;
        } | null;
        enableLink?: boolean | null;
        link?: {
          type?: ('reference' | 'custom') | null;
          newTab?: boolean | null;
          reference?:
            | ({
                relationTo: 'pages';
                value: string | Page;
              } | null)
            | ({
                relationTo: 'posts';
                value: string | Post;
              } | null);
          url?: string | null;
          label: string;
          /**
           * Choose how the link should be rendered.
           */
          appearance?: ('default' | 'outline') | null;
        };
        id?: string | null;
      }[]
    | null;
  sectionColor?: ('none' | 'accent' | 'secondary' | 'dark') | null;
  id?: string | null;
  blockName?: string | null;
  blockType: 'content';
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "MediaBlock".
 */
export interface MediaBlock {
  media: string;  // Media ID
  id?: string | null;
  blockName?: string | null;
  blockType: 'mediaBlock';
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "PostListBlock".
 */
export interface PostListBlock {
  introContent?: {
    root: {
      type: string;
      children: { // This can't have nested children
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  populateBy?: ('collection' | 'selection') | null;
  categories?: (string | Category)[] | null;
  limit?: number | null;
  selectedDocs?:
    | {
        relationTo: 'posts';
        value: string | Post;
      }[]
    | null;
  id?: string | null;
  blockName?: string | null;
  blockType: 'postList';
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "EventListBlock".
 */
export interface EventListBlock {
  introContent?: {
    root: {
      type: string;
      children: { // This can't have nested children
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  populateBy?: ('collection' | 'selection') | null;
  limit?: number | null;
  selectedDocs?:
    | {
        relationTo: 'events';
        value: string | Event;
      }[]
    | null;
  blockName?: string | null;
  blockType: 'eventList';
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "events".
 */
export interface Event {
  id: string;
  title: string;
  eventImage?: string | null;  // Media ID
  /**
   * Here you can add a relevant video link for the event. If a link is provided, we'll embed it on the event. You can paste any YouTube or Vimeo share link - it will be automatically converted to the embeddable format.
   */
  videoLink?: string | null;
  content: {
    root: {
      type: string;
      children: { // This can't have nested children
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  };
  location?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "FormBlock".
 */
export interface FormBlock {
  form: string | Form;
  enableIntro?: boolean | null;
  introContent?: {
    root: {
      type: string;
      children: { // This can't have nested children
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  id?: string | null;
  blockName?: string | null;
  blockType: 'formBlock';
}
/**
 * This interface was referenced by \`Config\`'s JSON-Schema
 * via the \`definition\` "forms".
 */
export interface Form {
  id: string;
  title: string;
  fields?:
    | (
        | {
            name: string;
            label?: string | null;
            width?: number | null;
            required?: boolean | null;
            defaultValue?: boolean | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'checkbox';
          }
        | {
            name: string;
            label?: string | null;
            width?: number | null;
            required?: boolean | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'country';
          }
        | {
            name: string;
            label?: string | null;
            width?: number | null;
            required?: boolean | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'email';
          }
        | {
            message?: {
              root: {
                type: string;
                children: { // This can't have nested children
                  type: string;
                  version: number;
                  [k: string]: unknown;
                }[];
                direction: ('ltr' | 'rtl') | null;
                format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
                indent: number;
                version: number;
              };
              [k: string]: unknown;
            } | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'message';
          }
        | {
            name: string;
            label?: string | null;
            width?: number | null;
            defaultValue?: number | null;
            required?: boolean | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'number';
          }
        | {
            name: string;
            label?: string | null;
            width?: number | null;
            defaultValue?: string | null;
            placeholder?: string | null;
            options?:
              | {
                  label: string;
                  value: string;
                  id?: string | null;
                }[]
              | null;
            required?: boolean | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'select';
          }
        | {
            name: string;
            label?: string | null;
            width?: number | null;
            required?: boolean | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'state';
          }
        | {
            name: string;
            label?: string | null;
            width?: number | null;
            defaultValue?: string | null;
            required?: boolean | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'text';
          }
        | {
            name: string;
            label?: string | null;
            width?: number | null;
            defaultValue?: string | null;
            required?: boolean | null;
            id?: string | null;
            blockName?: string | null;
            blockType: 'textarea';
          }
      )[]
    | null;
  submitButtonLabel?: string | null;
  /**
   * Choose whether to display an on-page message or redirect to a different page after they submit the form.
   */
  confirmationType?: ('message' | 'redirect') | null;
  confirmationMessage?: {
    root: {
      type: string;
      children: { // This can't have nested children
        type: string;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  redirect?: {
    url: string;
  };
  /**
   * Send custom emails when the form submits. Use comma separated lists to send the same email to multiple recipients. To reference a value from this form, wrap that field's name with double curly brackets, i.e. {{firstName}}. You can use a wildcard {{*}} to output all data and {{*:table}} to format it as an HTML table in the email.
   */
  emails?:
    | {
        emailTo?: string | null;
        cc?: string | null;
        bcc?: string | null;
        replyTo?: string | null;
        emailFrom?: string | null;
        subject: string;
        /**
         * Enter the message that should be sent in this email.
         */
        message?: {
          root: {
            type: string;
            children: { // This can't have nested children
              type: string;
              version: number;
              [k: string]: unknown;
            }[];
            direction: ('ltr' | 'rtl') | null;
            format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
            indent: number;
            version: number;
          };
          [k: string]: unknown;
        } | null;
        id?: string | null;
      }[]
    | null;
  updatedAt: string;
  createdAt: string;
}
`
