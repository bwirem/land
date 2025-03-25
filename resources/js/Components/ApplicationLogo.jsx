export default function ApplicationLogo(props) {
    return (
        <img
            src="/img/logo.png" // Path to your logo image
            alt="Application Logo"
            className="w-8 h-8 mr-2" // Add any additional classes or styles here
            {...props} // Spread any additional props
        />
    );
}

