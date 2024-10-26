import styled from "@emotion/styled";

const Style = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  input {
    width: 100%;
    padding: 10px;
    height: 2.5em;
    border: none;
    border-radius: 5px;
    background-color: #1e1f22;
    font-size: 1em;
    color: #e0e0e0;
    outline: none;
  }

  .input-wrapper {
    display: block;
    width: 100%;
    border-radius: 5px;
  }

  .input-wrapper:focus-visible {
    outline: 4px solid #00a8fc;
  }

  label {
    position: relative;
    font-size: 0.8em;
    color: #b0b0b0;
    font-weight: bold;
  }

  label span {
    position: absolute;
    top: -0.1em;
    margin-left: 0.2em;
    color: #e67075;
  }
`;

interface TextFieldProps {
  label?: string;
  required?: boolean;
  type?: string;
  children?: React.ReactNode;
}

const TextField = (props: TextFieldProps) => {
  const { label, required, type, children } = props;

  return (
    <Style>
      <label>
        {label}
        {required && <span>*</span>}
      </label>
      <div className="input-wrapper" tabIndex={0}>
        <input type={type ? type : "text"} required={required} tabIndex={-1} />
      </div>
      {children}
    </Style>
  );
};

export default TextField;
