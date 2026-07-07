import Navbar from "./Navbar";

const Layout = ({ children, authUser, theme, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-200">
      <Navbar authUser={authUser} theme={theme} toggleTheme={toggleTheme} />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default Layout;
