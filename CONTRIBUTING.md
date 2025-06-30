# Contributing to Free Icons

Thank you for considering contributing to the Free Icons repository! We welcome contributions from the community to help us grow and improve our collection of icons. By contributing, you can make a positive impact and support others in their creative projects.

Please take a moment to review the guidelines below to ensure a smooth and effective contribution process.

## How to Contribute

1. Fork the repository to your GitHub account.
2. Clone the forked repository to your local machine.
3. Run `npm install && npm start` to start the development server.
4. Make your desired changes or additions to the icon collection in the `svgs` folder (you have to restart the development server if you make any changes in the `svgs` folder).
5. Test your changes to ensure they are valid JSON and the icons function as expected.
6. Commit your changes with a clear and descriptive commit message.
7. Push your changes to your forked repository.
8. Submit a pull request to the main Free Icons repository.

## Contribution Guidelines

To contribute an icon to the Free Icons project, please adhere to the following rules:

1. Check for Existing Icons: Before creating a new icon, please make sure that an icon with the same name does not already exist in the repository. Avoid duplicating icons to maintain a clean and organized collection.

2. Icon Naming Convention: When adding an icon, follow the naming convention: `{type}-{name}.svg`. The type should be one of the following: `thin`, `light`, `regular`, `solid`, `sharp-light`, `sharp-regular`, `sharp-solid`, or `brand`.

3. Types and Brand Icons: If you are creating an icon with a type other than "brand," you must also create icons for all other types except "brand." For "brand" icons, you have the option to create icons for other types as well, but it's not mandatory.

4. SVG Element Requirements: Each icon must be an SVG file and conform to the following requirements:

- Include the xmlns attribute in the SVG element.
- Define the viewBox attribute to ensure proper scaling and responsiveness.
- The SVG element should contain only one <path> element representing the icon's shape.
- The <path> element should have a d property specifying the path data for the icon.

5. Color Customization: To allow for easy customization, the color of the entire icon should be controlled by the `fill` property of the SVG. Avoid hardcoding specific colors in the icon file.

## Code of Conduct

We expect all contributors to abide by the [Code of Conduct](CODE_OF_CONDUCT.md) to foster a respectful and inclusive environment. Please familiarize yourself with the code of conduct before contributing.

## Licensing

By contributing to the Free Icons repository, you agree to license your contributions under the [Creative Commons Attribution 4.0 International (CC BY 4.0) license](LICENSE). This ensures that your contributions can be freely used, shared, and adapted by others.

If you have any questions or need assistance with the contribution process, please feel free to reach out to us.

Thank you once again for your interest in contributing to the Free Icons repository. We appreciate your support!

Happy contributing!
