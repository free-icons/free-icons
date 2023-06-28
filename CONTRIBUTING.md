# Contributing to Free Icons

Thank you for considering contributing to the Free Icons repository! We welcome contributions from the community to help us grow and improve our collection of icons. By contributing, you can make a positive impact and support others in their creative projects.

Please take a moment to review the guidelines below to ensure a smooth and effective contribution process.

## How to Contribute

1. Fork the repository to your GitHub account.
2. Clone the forked repository to your local machine.
3. Make your desired changes or additions to the icon collection in the `data.json` file.
4. Test your changes to ensure they are valid JSON and the icons function as expected.
5. Commit your changes with a clear and descriptive commit message.
6. Push your changes to your forked repository.
7. Submit a pull request to the main Free Icons repository.

## Contribution Guidelines

To maintain a high-quality collection of icons, we kindly request that you adhere to the following guidelines:

- Follow the JSON structure of the `data.json` file, which contains an array of objects with the following properties:
  - `name`: The name of the icon.
  - `type`: The type of the icon, which can only be one of: `brands`, `thin`, `light`, `regular`, `solid`, `sharp-light`, `sharp-regular`, `sharp-solid`.
  - `d`: The path data for the icon.
  - `viewBox`: The viewBox attribute for the icon.
- Ensure the `data.json` file remains valid JSON by validating it before submitting your contribution.
- Include clear and descriptive names for the icons.
- Maintain consistent quality and style throughout the icon collection.
- If you want to allow color customization, make sure the `fill` property of the SVG element is used to change the color of the entire icon. Avoid hard-coding specific colors in the `d` attribute.

## Code of Conduct

We expect all contributors to abide by the [Code of Conduct](CODE_OF_CONDUCT.md) to foster a respectful and inclusive environment. Please familiarize yourself with the code of conduct before contributing.

## Licensing

By contributing to the Free Icons repository, you agree to license your contributions under the [Creative Commons Attribution 4.0 International (CC BY 4.0) license](LICENSE). This ensures that your contributions can be freely used, shared, and adapted by others.

If you have any questions or need assistance with the contribution process, please feel free to reach out to us.

Thank you once again for your interest in contributing to the Free Icons repository. We appreciate your support!

Happy contributing!
