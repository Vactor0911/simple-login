import styled from "@emotion/styled";

const Style = styled.button`
    display: block;
    width: 100%;
    background-color: #5865F2;
    border: none;
    border-radius: 5px;
    color: white;
    padding: 10px 20px;
    transition: background-color 0.15s ease-in-out;
    cursor: pointer;

    &:hover {
        background-color: #4752C4;
    }

    &:focus-visible {
        outline: 4px solid #00A8FC;
        outline-offset: 2px;
    }
`;

interface ButtonProps {
    text?: string;
    children?: React.ReactNode;
    onClick?: () => void;
}

const Button = (props: ButtonProps) => {
    const { text, children, onClick } = props;

    return (
        <Style onClick={onClick}>
            <h3>{text}</h3>
            {children}
        </Style>
    )
}

export default Button;
