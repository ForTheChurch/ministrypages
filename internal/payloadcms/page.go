package payloadcms

// Page represents a page in the CMS
type PagePatch struct {
	ID          string  `json:"id,omitempty"`
	Title       *string `json:"title,omitempty"`
	Hero        *Hero   `json:"hero,omitempty"`
	Layout      []Block `json:"layout,omitempty"`
	Meta        *Meta   `json:"meta,omitempty"`
	PublishedAt *string `json:"publishedAt,omitempty"`
	Slug        *string `json:"slug,omitempty"`
	SlugLock    *bool   `json:"slugLock,omitempty"`
	UpdatedAt   *string `json:"updatedAt,omitempty"`
	CreatedAt   *string `json:"createdAt,omitempty"`
	Status      *string `json:"_status,omitempty"`
}

// Hero represents the hero section of a page
type Hero struct {
	Type     string      `json:"type"` // 'none' | 'highImpact' | 'mediumImpact' | 'lowImpact'
	RichText *RichText   `json:"richText,omitempty"`
	Links    []HeroLink  `json:"links,omitempty"`
	Media    interface{} `json:"media,omitempty"` // string | Media
}

// HeroLink represents a link in the hero section
type HeroLink struct {
	Link Link    `json:"link"`
	ID   *string `json:"id,omitempty"`
}

// Link represents a link with various options
type Link struct {
	Type       *string    `json:"type,omitempty"` // 'reference' | 'custom'
	NewTab     *bool      `json:"newTab,omitempty"`
	Reference  *Reference `json:"reference,omitempty"`
	URL        *string    `json:"url,omitempty"`
	Label      string     `json:"label"`
	Appearance *string    `json:"appearance,omitempty"` // 'default' | 'outline'
}

// Reference represents a reference to another document
type Reference struct {
	RelationTo string      `json:"relationTo"` // 'pages' | 'posts'
	Value      interface{} `json:"value"`      // string | Page | Post
}

// RichText represents rich text content
type RichText struct {
	Root map[string]interface{} `json:"root"`
}

// RichTextRoot represents the root structure of rich text
type RichTextRoot struct {
	Type      string                   `json:"type"`
	Children  []map[string]interface{} `json:"children"`
	Direction *string                  `json:"direction"` // 'ltr' | 'rtl'
	Format    string                   `json:"format"`    // 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
	Indent    int                      `json:"indent"`
	Version   int                      `json:"version"`
}

// Meta represents metadata for pages and posts
type Meta struct {
	Title       *string     `json:"title,omitempty"`
	Image       interface{} `json:"image,omitempty"` // string | Media
	Description *string     `json:"description,omitempty"`
}

// Block represents a layout block (union type)
type Block struct {
	BlockType string `json:"blockType"`
	// Embed all possible block types
	*TwoColumn
	*CallToActionBlock
	*ContentBlock
	*MediaBlock
	*ArchiveBlock
	*FormBlock
}

// Post represents a blog post in the CMS
type Post struct {
	ID               string            `json:"id,omitempty"`
	Title            string            `json:"title"`
	HeroImage        interface{}       `json:"heroImage,omitempty"` // string | Media
	Content          RichText          `json:"content"`
	RelatedPosts     []interface{}     `json:"relatedPosts,omitempty"` // []string | []Post
	Series           interface{}       `json:"series,omitempty"`       // string | Series
	Categories       []interface{}     `json:"categories,omitempty"`   // []string | []Category
	Meta             *Meta             `json:"meta,omitempty"`
	PublishedAt      *string           `json:"publishedAt,omitempty"`
	Authors          []interface{}     `json:"authors,omitempty"` // []string | []User
	PopulatedAuthors []PopulatedAuthor `json:"populatedAuthors,omitempty"`
	Slug             *string           `json:"slug,omitempty"`
	SlugLock         *bool             `json:"slugLock,omitempty"`
	UpdatedAt        string            `json:"updatedAt"`
	CreatedAt        string            `json:"createdAt"`
	Status           *string           `json:"_status,omitempty"`
}

// PopulatedAuthor represents a populated author reference
type PopulatedAuthor struct {
	ID   *string `json:"id,omitempty"`
	Name *string `json:"name,omitempty"`
}

// Media represents a media file in the CMS
type Media struct {
	ID           string      `json:"id"`
	Alt          *string     `json:"alt,omitempty"`
	Caption      *RichText   `json:"caption,omitempty"`
	UpdatedAt    string      `json:"updatedAt"`
	CreatedAt    string      `json:"createdAt"`
	URL          *string     `json:"url,omitempty"`
	ThumbnailURL *string     `json:"thumbnailURL,omitempty"`
	Filename     *string     `json:"filename,omitempty"`
	MimeType     *string     `json:"mimeType,omitempty"`
	Filesize     *int        `json:"filesize,omitempty"`
	Width        *int        `json:"width,omitempty"`
	Height       *int        `json:"height,omitempty"`
	FocalX       *float64    `json:"focalX,omitempty"`
	FocalY       *float64    `json:"focalY,omitempty"`
	Sizes        *MediaSizes `json:"sizes,omitempty"`
}

// MediaSizes represents different sizes of a media file
type MediaSizes struct {
	Thumbnail *MediaSize `json:"thumbnail,omitempty"`
	Square    *MediaSize `json:"square,omitempty"`
	Small     *MediaSize `json:"small,omitempty"`
	Medium    *MediaSize `json:"medium,omitempty"`
	Large     *MediaSize `json:"large,omitempty"`
	XLarge    *MediaSize `json:"xlarge,omitempty"`
	OG        *MediaSize `json:"og,omitempty"`
}

// MediaSize represents a specific size variant of a media file
type MediaSize struct {
	URL      *string `json:"url,omitempty"`
	Width    *int    `json:"width,omitempty"`
	Height   *int    `json:"height,omitempty"`
	MimeType *string `json:"mimeType,omitempty"`
	Filesize *int    `json:"filesize,omitempty"`
	Filename *string `json:"filename,omitempty"`
}

// Series represents a series of posts
type Series struct {
	ID          string      `json:"id,omitempty"`
	Title       string      `json:"title"`
	Image       interface{} `json:"image,omitempty"` // string | Media
	Description string      `json:"description"`
	Slug        *string     `json:"slug,omitempty"`
	SlugLock    *bool       `json:"slugLock,omitempty"`
	UpdatedAt   string      `json:"updatedAt"`
	CreatedAt   string      `json:"createdAt"`
}

// Category represents a content category
type Category struct {
	ID          string          `json:"id,omitempty"`
	Title       string          `json:"title"`
	Slug        *string         `json:"slug,omitempty"`
	SlugLock    *bool           `json:"slugLock,omitempty"`
	Parent      interface{}     `json:"parent,omitempty"` // string | Category
	Breadcrumbs []CategoryCrumb `json:"breadcrumbs,omitempty"`
	UpdatedAt   string          `json:"updatedAt"`
	CreatedAt   string          `json:"createdAt"`
}

// CategoryCrumb represents a breadcrumb item for categories
type CategoryCrumb struct {
	Doc   interface{} `json:"doc,omitempty"` // string | Category
	URL   *string     `json:"url,omitempty"`
	Label *string     `json:"label,omitempty"`
	ID    *string     `json:"id,omitempty"`
}

// User represents a user in the system
type User struct {
	ID                      string        `json:"id"`
	Name                    *string       `json:"name,omitempty"`
	UpdatedAt               string        `json:"updatedAt"`
	CreatedAt               string        `json:"createdAt"`
	Email                   string        `json:"email"`
	ResetPasswordToken      *string       `json:"resetPasswordToken,omitempty"`
	ResetPasswordExpiration *string       `json:"resetPasswordExpiration,omitempty"`
	Salt                    *string       `json:"salt,omitempty"`
	Hash                    *string       `json:"hash,omitempty"`
	LoginAttempts           *int          `json:"loginAttempts,omitempty"`
	LockUntil               *string       `json:"lockUntil,omitempty"`
	Sessions                []UserSession `json:"sessions,omitempty"`
	Password                *string       `json:"password,omitempty"`
}

// UserSession represents a user session
type UserSession struct {
	ID        string  `json:"id"`
	CreatedAt *string `json:"createdAt,omitempty"`
	ExpiresAt string  `json:"expiresAt"`
}

// TwoColumn represents a two-column layout block
type TwoColumn struct {
	ImagePosition *string     `json:"imagePosition,omitempty"` // 'left' | 'right'
	RichText      *RichText   `json:"richText,omitempty"`
	EnableLink    *bool       `json:"enableLink,omitempty"`
	Link          *Link       `json:"link,omitempty"`
	Image         interface{} `json:"image,omitempty"` // string | Media
	ID            *string     `json:"id,omitempty"`
	BlockName     *string     `json:"blockName,omitempty"`
	BlockType     string      `json:"blockType"` // 'twoColumn'
}

// CallToActionBlock represents a call-to-action block
type CallToActionBlock struct {
	RichText  *RichText  `json:"richText,omitempty"`
	Links     []HeroLink `json:"links,omitempty"`
	ID        *string    `json:"id,omitempty"`
	BlockName *string    `json:"blockName,omitempty"`
	BlockType string     `json:"blockType"` // 'cta'
}

// ContentBlock represents a content block with columns
type ContentBlock struct {
	Columns   []ContentColumn `json:"columns,omitempty"`
	ID        *string         `json:"id,omitempty"`
	BlockName *string         `json:"blockName,omitempty"`
	BlockType string          `json:"blockType"` // 'content'
}

// ContentColumn represents a column in a content block
type ContentColumn struct {
	Size       *string   `json:"size,omitempty"` // 'oneThird' | 'half' | 'twoThirds' | 'full'
	RichText   *RichText `json:"richText,omitempty"`
	EnableLink *bool     `json:"enableLink,omitempty"`
	Link       *Link     `json:"link,omitempty"`
	ID         *string   `json:"id,omitempty"`
}

// MediaBlock represents a media block
type MediaBlock struct {
	Media     interface{} `json:"media"` // string | Media
	ID        *string     `json:"id,omitempty"`
	BlockName *string     `json:"blockName,omitempty"`
	BlockType string      `json:"blockType"` // 'mediaBlock'
}

// ArchiveBlock represents an archive block
type ArchiveBlock struct {
	IntroContent *RichText          `json:"introContent,omitempty"`
	PopulateBy   *string            `json:"populateBy,omitempty"` // 'collection' | 'selection'
	RelationTo   *string            `json:"relationTo,omitempty"` // 'posts'
	Categories   []interface{}      `json:"categories,omitempty"` // []string | []Category
	Limit        *int               `json:"limit,omitempty"`
	SelectedDocs []ArchiveReference `json:"selectedDocs,omitempty"`
	ID           *string            `json:"id,omitempty"`
	BlockName    *string            `json:"blockName,omitempty"`
	BlockType    string             `json:"blockType"` // 'archive'
}

// ArchiveReference represents a reference in an archive block
type ArchiveReference struct {
	RelationTo string      `json:"relationTo"` // 'posts'
	Value      interface{} `json:"value"`      // string | Post
}

// FormBlock represents a form block
type FormBlock struct {
	Form         interface{} `json:"form"` // string | Form
	EnableIntro  *bool       `json:"enableIntro,omitempty"`
	IntroContent *RichText   `json:"introContent,omitempty"`
	ID           *string     `json:"id,omitempty"`
	BlockName    *string     `json:"blockName,omitempty"`
	BlockType    string      `json:"blockType"` // 'formBlock'
}

// Form represents a form in the CMS
type Form struct {
	ID                  string        `json:"id"`
	Title               string        `json:"title"`
	Fields              []FormField   `json:"fields,omitempty"`
	SubmitButtonLabel   *string       `json:"submitButtonLabel,omitempty"`
	ConfirmationType    *string       `json:"confirmationType,omitempty"` // 'message' | 'redirect'
	ConfirmationMessage *RichText     `json:"confirmationMessage,omitempty"`
	Redirect            *FormRedirect `json:"redirect,omitempty"`
	Emails              []FormEmail   `json:"emails,omitempty"`
	UpdatedAt           string        `json:"updatedAt"`
	CreatedAt           string        `json:"createdAt"`
}

// FormField represents a form field (union type)
// Note: defaultValue can be bool, int, or string depending on field type
type FormField struct {
	BlockType string `json:"blockType"`
	// Common fields
	Name      *string `json:"name,omitempty"`
	Label     *string `json:"label,omitempty"`
	Width     *int    `json:"width,omitempty"`
	Required  *bool   `json:"required,omitempty"`
	ID        *string `json:"id,omitempty"`
	BlockName *string `json:"blockName,omitempty"`

	// Type-specific fields - defaultValue can be different types
	DefaultValue interface{}       `json:"defaultValue,omitempty"` // bool for checkbox, int for number, string for text/textarea
	Placeholder  *string           `json:"placeholder,omitempty"`  // for select
	Options      []FormFieldOption `json:"options,omitempty"`      // for select
	Message      *RichText         `json:"message,omitempty"`      // for message
}

// FormFieldOption represents an option in a select field
type FormFieldOption struct {
	Label string  `json:"label"`
	Value string  `json:"value"`
	ID    *string `json:"id,omitempty"`
}

// FormRedirect represents a form redirect configuration
type FormRedirect struct {
	URL string `json:"url"`
}

// FormEmail represents an email configuration for forms
type FormEmail struct {
	EmailTo   *string   `json:"emailTo,omitempty"`
	CC        *string   `json:"cc,omitempty"`
	BCC       *string   `json:"bcc,omitempty"`
	ReplyTo   *string   `json:"replyTo,omitempty"`
	EmailFrom *string   `json:"emailFrom,omitempty"`
	Subject   string    `json:"subject"`
	Message   *RichText `json:"message,omitempty"`
	ID        *string   `json:"id,omitempty"`
}
