package auth

import (
	"github.com/labstack/echo/v4"
)

func (serv *AuthService) AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sessionCookie, err := c.Request().Cookie("session")
		if err == nil {
			userId, err := serv.u.GetUserBySession(c, sessionCookie.Value)
			if err == nil {
				c.Request().Header.Set("User-ID", userId)
			}
		}
		return next(c)
	}
}
