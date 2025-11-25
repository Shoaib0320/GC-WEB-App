import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const AppButton = ({ title, onPress, disabled = false, style = {}, ...props }) => {
  const { theme } = useContext(ThemeContext);

  const defaultStyle = {
    backgroundColor: disabled ? theme.colors.disabled : theme.colors.primary,
    color: disabled ? theme.colors.textSecondary : "#fff",
    padding: "12px 16px",
    borderRadius: 8,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    display: "inline-block",
    width: style.width || "auto",
    height: style.height || "auto",
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  const handleClick = (e) => {
    if (!disabled && onPress) {
      onPress(e);
    }
  };

  return (
    <button style={defaultStyle} onClick={handleClick} disabled={disabled} {...props}>
      {title}
    </button>
  );
};

export default AppButton;
