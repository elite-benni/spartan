# UI library

## Overall Architecture

Components are made up out of a brain, which is a headless accessible implementation
of the component. A UI component can be an Angular component or an Angular directive applied
to an existing HTML element or a combination of both if the UI component is more complicated.

On top of these brain components we put our helmet. Our helmet adds SPARTAN-like swagger to our UI.
Most of the time our helmets are added by applying the hlm + component name directive.
An example:
`<button hlmBtn >...</button>` this applies the SPARTAN styles to the button element.

Appearance only UI components that do not provide any other functionality are also
Angular components, e.g. the `<hlm-skeleton/>` component allows you to build a skeleton UI.

## Roadmap (46/48)

- [x] Accordion
- [x] Alert
- [x] Alert Dialog
- [x] Aspect Ratio
- [x] Avatar
- [x] Badge
- [x] Breadcrumb
- [x] Button
- [x] Calendar
- [x] Card
- [x] Checkbox
- [x] Collapsible
- [x] Combobox
- [x] Command
- [x] Context Menu
- [x] Data Table (needs better docs)
- [x] Date Picker
- [x] Dialog
- [x] Dropdown Menu
- [ ] Form
- [x] Form Field
- [x] Hover Card
- [x] Icon
- [x] Input
- [x] Input OTP
- [x] Label
- [x] Menubar
- [ ] Navigation Menu
- [x] Pagination
- [x] Popover
- [x] Progress
- [x] Radio Group
- [x] Scroll Area
- [x] Select
- [x] Separator
- [x] Sheet
- [x] Skeleton
- [x] Slider
- [x] Sonner (Toast)
- [x] Spinner
- [x] Switch
- [x] Table (needs better docs)
- [x] Tabs
- [x] Textarea (covered by hlmInput directive)
- [x] Toggle
- [x] Toggle Group
- [x] Tooltip
- [x] Typography
