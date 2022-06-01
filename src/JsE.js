//{{ Error Handling }}\\

class JStarError extends Error {
	constructor(Name,Message){
		super(Message).name=Name	
	}
}

const ErrorHandler = {
	ErrorTypes:{
		ExpectedGot:(a,b)=>`Expected ${a}, got ${b} instead!`,
		Unexpected:(a)=>`Unexpected ${a}`,
		Expected:(a)=>`Expected ${a}`,
	},
	Error(Options={}){
		let {Start,End,Arguments,Type,Name}=Options;
		let Call=this.ErrorTypes[Type];
		if(!Call)throw Error(`${Type} is not a valid error type!`);
		let Line=undefined,Index=undefined;
		if(Options.Token)Line=Options.Token.Line,Index=Options.Token.Index;
		else Line=Options.Line,Index=Options.Index;
		throw new JStarError(Name||"JStarError",`${Start||""}${Call(...Arguments)}${End||""} on line ${Line} at index ${Index}`)
	}
};
