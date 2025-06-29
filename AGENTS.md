# AGENTS.md

## Structure

### Feature Sliced Design

Project use [Feature Sliced Design](https://feature-sliced.design/) architecture.

In `/src` directory, you can find the following folders:

- **app** — everything that makes the app run — routing, entrypoints, global styles, providers.
- **pages** — full pages or large parts of a page in nested routing.
- **widgets** — large self-contained chunks of functionality or UI, usually delivering an entire use case.
- **features** — reused implementations of entire product features, i.e. actions that bring business value to the user.
- **entities** — business entities that the project works with, like user or product.
- **shared** — reusable functionality, especially when it's detached from the specifics of the project/business, though
  not necessarily.

### Example

Suppose you want to add support for switching input devices in your game.

This feature doesn’t currently exist, so you create a new Entity:

#### 📁 DeviceController

Entity Structure:

1. Store for managing selected input controller and available options:
    - src/entities/DeviceController/model/controllerStore.ts
2. UI component to display the list of available input devices:
    - src/entities/DeviceController/ui/ControllerList/ControllerList.vue
3. Storybook file:
    - src/entities/DeviceController/ui/ControllerList/ControllerList.stories.vue
4. Entity entrypoint:
    - src/entities/DeviceController/index.ts

You also want users to be able to change their controller in the game settings.

To support this, you create a Feature:

#### 📁 ChangeDeviceController (sound like a verb!)

- UI component to handle user input and update the store:
    - src/features/ChangeDeviceController/ui/ChangeDeviceController.vue
- Feature entrypoint:
    - src/features/ChangeDeviceController/index.ts

Then you create a Widget to bundle everything for use in the settings screen:

#### 📁 DeviceControllerSettings

The widget:

- Reads controller data from the store
- Renders ControllerList.vue
- Injects ChangeDeviceController.vue via slot or scoped prop
- UI component:
    - src/widgets/DeviceControllerSettings/ui/DeviceControllerSettings.vue
- Widget entrypoint:
    - src/widgets/DeviceControllerSettings/index.ts

#### Integration

In your main app layout (e.g. App.vue), use:

```vue

<DeviceControllerSettings />
```

## Code style

- use `this._privateMethod()` instead of `this.#privateMethod()` for private methods

## Prepare code for review

```bash
npm run lint
npm run format
nom run type-check
```

If you have any errors, fix them before creating a PR.
