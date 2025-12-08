package auth

import (
	"fmt"

	"github.com/labstack/echo/v4"
)

func (serv *AuthService) AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sessionCookie, err := c.Request().Cookie("session")
		if err == nil {
			userId, userLgin, err := serv.u.GetUserBySession(c, sessionCookie.Value)
			if err == nil {
				fmt.Println(userId, userLgin)
				c.Request().Header.Set("User-ID", userId)
				c.Request().Header.Set("User-Name", userLgin)
			}
		}
		return next(c)
	}
}
