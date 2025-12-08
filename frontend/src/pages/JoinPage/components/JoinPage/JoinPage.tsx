import { joinBoardByInviteLink } from "#entities/board";
import { Errors } from "#shared";
import { LoggedInPage } from "#widgets/Page";
import { Spinner } from "#widgets/Spinner";
import { useCallback, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export function JoinPage() {
    const params = useParams();
    const navigator = useNavigate();
    const [searchParams] = useSearchParams();

    const onJoin = useCallback(async () => {
        const { error } = await joinBoardByInviteLink(params.id + "?c=" + searchParams.get("c"))
        if (error === Errors.NoError) {
            navigator("/board/" + params.id);
        }
    }, [params, searchParams, navigator]);

    useEffect(() => {
        onJoin();
    }, [onJoin]);

    return <LoggedInPage centered noNav noFullscreen color="background">
        <Spinner />
    </LoggedInPage>
}