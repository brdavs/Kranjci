import { Route, Switch } from "wouter-preact";
import Home from "./routes/Home";
import Shows from "./routes/Shows";
import Music from "./routes/Music";
import Contact from "./routes/Contact";
import News from "./routes/News";
import NewsPost from "./routes/NewsPost";
import Members from "./routes/Members";
import Member from "./routes/Member";
import History from "./routes/History";
import Clients from "./routes/Clients";
import Privacy from "./routes/Privacy";
import NotFound from "./routes/NotFound";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { useSiteNavigation } from "./hooks/useSiteNavigation";

export function App() {
    const { menuOpen, scrolled, useBurger, toggleMenu, closeMenu } = useSiteNavigation();

    return (
        <>
            <SiteHeader
                scrolled={scrolled}
                useBurger={useBurger}
                menuOpen={menuOpen}
                onToggleMenu={toggleMenu}
                onCloseMenu={closeMenu}
            />

            <main id="main-content" role="main">
                <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/shows" component={Shows} />
                    <Route path="/music" component={Music} />
                    <Route path="/contact" component={Contact} />
                    <Route path="/news" component={News} />
                    <Route path="/news/:slug" component={NewsPost} />
                    <Route path="/history" component={History} />
                    <Route path="/clients" component={Clients} />
                    <Route path="/members" component={Members} />
                    <Route path="/privacy" component={Privacy} />
                    <Route path="/member/:slug" component={Member} />
                    <Route component={NotFound} />
                </Switch>
            </main>

            <SiteFooter />
        </>
    );
}
